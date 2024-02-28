// will pick this reinventing of wheel later on
import React, { DragEvent, useEffect } from 'react';

type BoxElement = {
  num: number;
  ref: React.RefObject<HTMLDivElement>;
};

const DnDPersonalized = () => {
  const [activeBoxList, setActiveBoxList] = React.useState<BoxElement[]>(
    Array.from({ length: 5 }, (_, i) => ({ num: i, ref: React.createRef<HTMLDivElement>() }))
  );

  const draggingBox = React.useRef<BoxElement | null>(null);

  const printPositions = () => {
    activeBoxList.forEach(({ ref, num }, i) => {
      const box = ref.current;
      if (box) {
        const rect = box.getBoundingClientRect();
        console.log({ num, rectX: rect.x, i });
      }
    });
  };

  useEffect(() => {
    printPositions();
  }, []);

  const handleOnDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = "move";
    console.log("drag", e.clientX, e.clientY);
  }

  const handleDragDrop = (e: DragEvent<HTMLDivElement>) => {
    // find the closest element to the drop position
    console.log("drop", e.clientX, e.clientY)
    const dropX = e.clientX;
    let minDistance = Infinity;
    let justCrossed = -1;
    activeBoxList.forEach(({ ref }, i) => {
      const box = ref.current;
      if (box) {
        const rect = box.getBoundingClientRect();
        const distance = Math.abs(dropX - rect.x);
        if (distance < minDistance && dropX - rect.x > 0) {
          minDistance = distance;
          justCrossed = i;
        }
      }
    });

    if (justCrossed === -1) return;
    console.log(justCrossed, minDistance, draggingBox.current);
    setActiveBoxList((prev) => {
      // removing the moving box & adding it to the closest position
      let newList = prev.filter((i) => i !== draggingBox.current);
      if (!draggingBox.current) return newList;
      newList = [
        ...newList.slice(0, justCrossed),
        draggingBox.current,
        ...newList.slice(justCrossed),
      ]
      return newList;
    });
    printPositions();
    draggingBox.current = null;
  }

  return (
    <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-10 lg:text-left">
      {activeBoxList.map((ele) => (
        <div
          key={ele.num}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          draggable
          onDragStart={(e) => {
            draggingBox.current = ele;
            handleOnDragStart(e)
          }}
          onDragEnd={handleDragDrop}
          ref={ele.ref}
        >
          {ele.num}
        </div>
      ))}
    </div>
  );
};

export default DnDPersonalized;