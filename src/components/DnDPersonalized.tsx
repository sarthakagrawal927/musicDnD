import React, { DragEvent, createRef, useRef, useState } from 'react';
import { Source } from '@/constants';
import { getSongTags } from '@/hooks/useGetSongTags';
import { useDndListContext } from '@/state/DnDContext';
import { BoxElement } from '@/types';
import cn from "classnames";

/*to properly decouple the list:
- Have ability to see the total ordered list of items
  - Can add forwardRef to this component to have a function that returns the next valid element
  - Share the ordered list state (-)

- Ability to add new elements to stash with ease
  - Share the stashed list across state (?)

- Get active selected element (if someone wants to play any song)
  - Share the stashed list across state (-)
  - Pass function to elements to setActiveElement
*/

const preventDefault = (e: DragEvent<HTMLDivElement>) => {
  e.stopPropagation();
  e.preventDefault();
}

type DnDPersonalizedProps<T> = {
  reactElement: (props: T) => React.JSX.Element
}

function DnDPersonalized<T>(props: DnDPersonalizedProps<T>): JSX.Element {
  const {
    items: activeBoxList, setItems: setActiveBoxList,
    activeItem, setActiveItem
  } = useDndListContext<BoxElement<T>>();
  const [onHoldItems, setOnHoldItems] = useState<BoxElement<T>[]>([]);

  const draggingBox = useRef<BoxElement<T> | null>(null);
  const draggedToBox = useRef<BoxElement<T> | null>(null);
  const draggedBoxIdx = useRef<number | null>(null);

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
    let boxNodePropsArray: BoxElement<T>[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const fileName = e.target.files[i].name;
      const songFields = (await getSongTags(e.target.files[i])) as T;
      boxNodePropsArray.push({
        ref: createRef<HTMLDivElement>(),
        source: Source.STASH,
        uniqueKey: `${fileName}-${i}-${Math.random().toString(36).substring(7)}`,
        componentFields: songFields,
        element: props.reactElement,
      })
    }
    setOnHoldItems((prev) => ([
      ...prev,
      ...boxNodePropsArray
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
            className={cn({
              ["border border-red-300"]: ele.uniqueKey === activeItem?.uniqueKey,
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
            onClick={() => setActiveItem(ele)}
          >
            {ele.element(ele.componentFields)}
          </div>
        ))}
      </div>
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
            {ele.element(ele.componentFields)}
          </div>))}
      </div>
    </>
  );
};

export default DnDPersonalized;