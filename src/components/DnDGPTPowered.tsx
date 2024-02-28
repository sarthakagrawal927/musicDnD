// ChatGPT powered
// since this replaces need to ensure that it user's cursor for movement is limited to the row of divs, so continuous replacements can make it look like the user is dragging the divs around,
// but since we want to insert / remove divs, need something better
import React, { useState } from 'react';

const DragAndDropContainer: React.FC = () => {
  const [items, setItems] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, item: number) => {
    // event.dataTransfer.effectAllowed = 'move';
    setDraggedItem(item);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    event.preventDefault();
    if (draggedItem !== null) {
      const draggedIndex = items.indexOf(draggedItem);
      const newItems = [...items];

      // Swap the dragged item with the target item
      newItems[draggedIndex] = items[targetIndex];
      newItems[targetIndex] = draggedItem;

      setItems(newItems);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-10 lg:text-left">
      {items.map((item, index) => (
        <div
          key={item}
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          Div {item}
        </div>
      ))}
    </div>
  );
};

export default DragAndDropContainer;
