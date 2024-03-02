import SingleSongNode from '@/components/SongNode';
import React, { DragEvent, useRef, useState, createRef, RefObject, ReactNode, useEffect } from 'react';

enum Source {
  ACTIVE = "active",
  STASH = "stash",
}

type BoxElement = {
  uniqueKey: string;
  reactNode: ReactNode;
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
  const [activeAudioFiles, setActiveAudioFiles] = useState<HTMLAudioElement[]>([]);

  useEffect(() => {
    if (activeAudioFiles.length > 0) {
      activeAudioFiles[0].play();
      activeAudioFiles[0].onended = () => {
        console.log('ended');
      }
    }
  }, [activeAudioFiles]);

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

  const handleManyFileAddition = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    let audioFileNodes: { node: ReactNode, fileName: string }[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      audioFileNodes.push({
        node: <SingleSongNode blob={e.target.files[i]} />,
        fileName: e.target.files[i].name,
      });
    }
    setOnHoldItems((prev) => ([
      ...prev,
      ...audioFileNodes.map(({ node, fileName }, idx) => ({
        reactNode: node,
        ref: createRef<HTMLDivElement>(),
        source: Source.STASH,
        uniqueKey: `${fileName}-${idx}-${Math.random().toString(36).substring(7)}`,
      }))
    ]))
  }

  return (
    <>
      <input multiple accept="audio/mpeg3" type="file" onChange={handleManyFileAddition} />
      <div
        onDrop={handleListDrop}
        onDragOver={preventDefault}
        className='border border-dashed border-gray-400 min-h-40 grid lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-10 lg:text-left'
      >
        {activeBoxList.map((ele, idx) => (
          <div
            key={`${ele.uniqueKey}-${idx}`}
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 align-middle justify-center flex items-center"
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
          >
            {ele.reactNode}
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
              className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 align-middle justify-center flex items-center"
              draggable
              onDragStart={(e) => {
                draggingBox.current = ele;
              }}
            >
              {ele.reactNode}
            </div>))}
        </div>
      </div>
    </>
  );
};

export default DnDPersonalized;