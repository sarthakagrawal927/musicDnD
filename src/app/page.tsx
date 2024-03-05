"use client";
import DnDPersonalized from '@/components/DnDPersonalized';
import SingleSongNode from '@/components/SongNode';
import SongPlayer from '@/components/SongPlayer';
import { DnDListProvider } from '@/state/DnDContext';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <DnDListProvider initialItems={[]}>
        <SongPlayer />
        <DnDPersonalized reactElement={SingleSongNode} />
      </DnDListProvider>
    </main >
  );
}
