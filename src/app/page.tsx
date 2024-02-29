// Self attempt, didn't work as expected
"use client";
import DragAndDropContainer from '@/components/DnDGPTPowered';
import DnDPersonalized from '@/components/DnDPersonalized';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <DragAndDropContainer />
      <DnDPersonalized />
    </main>
  );
}
