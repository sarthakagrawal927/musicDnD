import SingleSongNode from '@/components/SongNode';
import { SongFields, getSongTags } from '@/hooks/useGetSongTags';
import React, { DragEvent, RefObject, createRef, useCallback, useRef, useState } from 'react';
import SongPlayer, { SongNodeRef } from './SongPlayer';
import cn from "classnames"

enum Source {
  ACTIVE = "active",
  STASH = "stash",
}

enum PlayNext {
  FORWARD = "forward",
  BACKWARD = "backward"
}

type BoxElement = {
  uniqueKey: string;
  songFields: SongFields
  ref: RefObject<HTMLDivElement>;
  source: Source;
};

const preventDefault = (e: DragEvent<HTMLDivElement>) => {
  e.stopPropagation();
  e.preventDefault();
}

const DnDPersonalized = () => {
  const [activeBoxList, setActiveBoxList] = useState<BoxElement[]>([]);
  const [onHoldItems, setOnHoldItems] = useState<BoxElement[]>([]);

  const draggingBox = useRef<BoxElement | null>(null);
  const draggedToBox = useRef<BoxElement | null>(null);
  const draggedBoxIdx = useRef<number | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<BoxElement | null>(null);
  const songPlayerRef = createRef<SongNodeRef>();

  const getInsertPosition = (e: DragEvent<HTMLDivElement>): number => {
    // will think considering draggedToBox
    const closestPosition = getClosestPosition(e);
    if (closestPosition !== -1) {
      return closestPosition;
    }
    return 0;
  }

  const getClosestPosition = (e: DragEvent<HTMLDivElement>): number => {
    const dropX = e.clientX;
    let minDistance = Infinity;
    let closestEle = -1;
    activeBoxList.forEach(({ ref }, i) => {
      const box = ref.current;
      if (box) {
        const rect = box.getBoundingClientRect();
        const distance = Math.abs(dropX - rect.x);
        if (distance < minDistance) {
          minDistance = distance;
          closestEle = i;
        }
      }
    });
    return closestEle
  }

  const handleStashDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingBox.current?.source === Source.STASH) return;

    setOnHoldItems((prev) => {
      if (!draggingBox.current) return prev;
      return [...prev, { ...draggingBox.current, source: Source.STASH }];
    });

    setActiveBoxList((prev) => {
      if (!draggingBox.current) return prev;
      return prev.filter((i) => i !== draggingBox.current);
    });
  }

  const handleListDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingBox.current) return;

    if (!draggedToBox.current || draggedBoxIdx.current === null) { // not over any element, just add to end
      setActiveBoxList((prev) => {
        if (!draggingBox.current) return prev;
        return [...prev, { ...draggingBox.current, source: Source.ACTIVE }];
      });
    } else {
      const closest = getInsertPosition(e);
      const newActiveBoxList = [...activeBoxList];
      const draggedBox = draggingBox.current;
      if (draggedBox.source === Source.ACTIVE) {
        newActiveBoxList.splice(newActiveBoxList.indexOf(draggedBox), 1);
      }
      const toMovePosition = closest + (draggedBox.source === Source.ACTIVE && closest > draggedBoxIdx.current && closest ? -1 : 0);
      newActiveBoxList.splice(toMovePosition, 0, {
        ...draggedBox,
        source: Source.ACTIVE,
      });
      setActiveBoxList(newActiveBoxList);
    }

    if (draggingBox.current?.source === Source.STASH) {
      setOnHoldItems((prev) => {
        if (!draggingBox.current) return prev;
        return prev.filter((i) => i !== draggingBox.current);
      });
    }
  }

  const handleManyFileAddition = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    let boxNodePropsArray: BoxElement[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const fileName = e.target.files[i].name;
      const songFields = await getSongTags(e.target.files[i]);
      boxNodePropsArray.push({
        ref: createRef<HTMLDivElement>(),
        source: Source.STASH,
        uniqueKey: `${fileName}-${i}-${Math.random().toString(36).substring(7)}`,
        songFields,
      })
    }
    setOnHoldItems((prev) => ([
      ...prev,
      ...boxNodePropsArray
    ]))
  }

  const startPlaying = () => {
    if (currentlyPlaying) {
      songPlayerRef.current?.playSong()
      return;
    }
    if (activeBoxList.length < 1) return;
    setCurrentlyPlaying(activeBoxList[0])
  }

  const pausePlaying = () => {
    songPlayerRef.current?.pauseSong()
  }

  const playNext = useCallback((direction = PlayNext.BACKWARD) => {
    if (!currentlyPlaying) return;
    const currIdx = activeBoxList.findIndex((ele) =>
      ele.uniqueKey === currentlyPlaying.uniqueKey
    )
    if (currIdx === -1) return;
    setCurrentlyPlaying(
      activeBoxList[(currIdx + (direction === PlayNext.FORWARD ? 1 : -1) + activeBoxList.length) % activeBoxList.length]
    )
  }, [currentlyPlaying, activeBoxList])

  const playForward = () => playNext(PlayNext.FORWARD)
  const playBackward = () => playNext(PlayNext.BACKWARD)

  return (
    <>
      <input multiple accept="audio/mpeg3" type="file" onChange={handleManyFileAddition} />
      {!currentlyPlaying && <button onClick={startPlaying}>Start</button>}
      <div className='flex flex-row space-x-3'>
        <button onClick={playBackward}>Prev</button>
        <button onClick={playForward}>Next</button>
      </div>
      {currentlyPlaying && <SongPlayer handleSongEnd={playForward} currentSong={currentlyPlaying?.songFields} ref={songPlayerRef} />}
      <div
        onDrop={handleListDrop}
        onDragOver={preventDefault}
        className='border border-dashed border-gray-400 min-h-40 grid lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-10 lg:text-left'
      >
        {activeBoxList.map((ele, idx) => (
          <div
            key={`${ele.uniqueKey}-${idx}`}
            className={cn({
              ["border border-red-300"]: ele.uniqueKey === currentlyPlaying?.uniqueKey,
            })}
            draggable
            onDragStart={(e) => {
              draggingBox.current = ele;
            }}
            onDragEnter={(e) => {
              preventDefault(e);
              draggedToBox.current = ele;
              draggedBoxIdx.current = idx;
            }}
            ref={ele.ref}
            onClick={() => setCurrentlyPlaying(ele)}
          >
            <SingleSongNode songFields={ele.songFields} />
          </div>
        ))}
      </div>
      <div>
        <div
          className="w-60 min-h-60 border border-dashed border-gray-400"
          onDragOver={preventDefault}
          onDrop={handleStashDrop}
        >
          {onHoldItems.map((ele, idx) => (
            <div
              key={`${ele.uniqueKey}-${idx}`}
              draggable
              onDragStart={(e) => {
                draggingBox.current = ele;
              }}
            >
              <SingleSongNode songFields={ele.songFields} />
            </div>))}
        </div>
      </div>
    </>
  );
};

export default DnDPersonalized;