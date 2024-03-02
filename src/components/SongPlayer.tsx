import React, { Ref, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { SongFields } from '@/hooks/useGetSongTags';
import Image from 'next/image';

type SongPlayerProps = {
  currentSong: SongFields,
  handleSongEnd: () => void
}

export type SongNodeRef = {
  playSong: () => void;
  isPlaying: () => boolean;
  pauseSong: () => void;
}

const SongPlayer = forwardRef(({ currentSong, handleSongEnd }: SongPlayerProps, ref: Ref<SongNodeRef>) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    playSong();
  }, [currentSong])

  const isPlaying = () => {
    return isPlayingRef.current;
  }

  const playSong = () => {
    console.log('playing', currentSong.title)
    audioRef.current?.play()
    isPlayingRef.current = true;
  }

  const pauseSong = () => {
    console.log('pausing', currentSong.title)
    audioRef.current?.pause();
    isPlayingRef.current = false;
  }

  useImperativeHandle(ref, () => ({
    playSong, pauseSong, isPlaying
  }));

  return (
    <div>
      {currentSong.cover && <Image src={currentSong.cover} alt={currentSong.title} width={400} height={400} />}
      <audio
        ref={audioRef}
        controls
        src={currentSong.audioElement.src}
        onEnded={handleSongEnd}
      />
    </div>
  );
});

SongPlayer.displayName = "SongPlayer"

export default SongPlayer;