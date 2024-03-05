import React, { Dispatch, PropsWithChildren, SetStateAction, createContext, useContext, useState } from "react";

type DnDContextType<T> = {
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>
  activeItem: T,
  setActiveItem: Dispatch<SetStateAction<T>>
}

const DnDListContext = createContext<DnDContextType<any> | undefined>({
  items: [],
  activeItem: [],
  setItems: () => { },
  setActiveItem: () => { }
});

function useDndListContext<T>(): DnDContextType<T> {
  const context = useContext(DnDListContext);
  if (!context) {
    throw new Error('useDndListContext must be used within a DnDListProvider');
  }
  return context as DnDContextType<T>;
}

function DnDListProvider<T>({ initialItems, children }: { initialItems: T[] } & PropsWithChildren) {
  const [items, setItems] = useState(initialItems);
  const [activeItem, setActiveItem] = useState(undefined);
  return <DnDListContext.Provider value={{ items, setItems, activeItem, setActiveItem }}>
    {children}
  </DnDListContext.Provider>
}

export { DnDListProvider, useDndListContext }