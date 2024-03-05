import { useDndListContext } from '@/state/DnDContext';
import { BoxElement, SongFields } from '@/types';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

enum PlayNext {
  FORWARD = "forward",
  BACKWARD = "backward"
}

const SongPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const {
    activeItem = {} as BoxElement<SongFields>,
    items, setActiveItem
  } = useDndListContext<BoxElement<SongFields>>();

  const currentSong = activeItem.componentFields

  const playSong = useCallback(() => {
    audioRef.current?.play()
    setIsPlaying(true);
  }, [])

  const togglePlay = () => {
    if (isPlaying) audioRef.current?.pause();
    else audioRef.current?.play();
    setIsPlaying((prev) => !prev);
  }

  useEffect(() => {
    if (currentSong) playSong();
  }, [playSong, currentSong])

  const startPlaying = () => {
    if (currentSong) return playSong()
    if (items.length < 1) return;
    setActiveItem(items[0])
  }

  const playNext = useCallback((direction = PlayNext.BACKWARD) => {
    if (!currentSong) return;
    const currIdx = items.findIndex((ele) =>
      ele.uniqueKey === activeItem.uniqueKey
    )
    if (currIdx === -1) return;
    setActiveItem(
      items[(currIdx + (direction === PlayNext.FORWARD ? 1 : -1) + items.length) % items.length]
    )
  }, [activeItem, items])

  const playForward = () => playNext(PlayNext.FORWARD)
  const playBackward = () => playNext(PlayNext.BACKWARD)

  return (
    <div>
      {!currentSong && <button onClick={startPlaying}>Start</button>}
      <div className='flex flex-row space-x-3'>
        <button onClick={playBackward}>Prev</button>
        <button onClick={playForward}>Next</button>
        {currentSong && <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>}
      </div>
      {currentSong && <>
        <Image src={currentSong.cover} alt={currentSong.title} width={400} height={400} />
        <audio
          ref={audioRef}
          controls
          src={currentSong.audioElement.src}
          onEnded={playBackward}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      </>}
    </div>
  );
}

export default SongPlayer;