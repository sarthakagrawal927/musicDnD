import React, { Ref, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Image from 'next/image';
import jsonmediatags from "./jsmediatags.js";

type SingleSongNodeProps = {
  blob: Blob;
  songEnded: () => void;
  uniqueKey: string;
}

type SongFields = {
  title: string;
  cover: string;
  artist: string;
  audioElement: HTMLAudioElement;
}

type JsonMediaTags = {
  title: string;
  cover: string;
  artist: string;
  year: string;
  picture: {
    format: string;
    data: number[];
    type: string;
    description: string;
  }
}

export type SongNodeRef = {
  playSong: () => void;
  isPlaying: () => boolean;
  pauseSong: () => void;
}

const getCoverImageUrl = (data: number[]): string => {
  const byteArray = new Uint8Array(data);
  const blob = new Blob([byteArray], { type: 'image/jpeg' });
  const url = URL.createObjectURL(blob);
  return url;
}

const SingleSongNode = forwardRef(({ blob, songEnded, uniqueKey }: SingleSongNodeProps, ref: Ref<SongNodeRef>) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    const blobUrl = URL.createObjectURL(blob);
    const audio = new Audio(blobUrl);
    console.log("here")
    jsonmediatags.read(blob, {
      onSuccess: function ({ tags }: { tags: JsonMediaTags }) {
        const imageUrl = getCoverImageUrl(tags.picture.data);
        setSongFields((prev) => ({ ...prev, audioElement: audio, cover: imageUrl, title: tags.title, artist: tags.artist }));
      },
    })
  }, []);

  const [songFields, setSongFields] = React.useState<SongFields>({
    title: '',
    cover: '',
    audioElement: new Audio(),
    artist: '',
  });

  const isPlaying = () => {
    return isPlayingRef.current;
  }

  const playSong = () => {
    console.log('playing', songFields.title)
    audioRef.current?.play()
    isPlayingRef.current = true;
  }

  const pauseSong = () => {
    console.log('pausing', songFields.title)
    audioRef.current?.pause();
    isPlayingRef.current = false;
  }

  useImperativeHandle(ref, () => ({
    playSong, pauseSong, isPlaying
  }));

  return (
    <React.Fragment key={uniqueKey}>
      {songFields.cover && <Image src={songFields.cover} alt={songFields.title} width={50} height={50} />}
      <p>{songFields.title} by {songFields.artist}</p>
      <audio ref={audioRef} src={songFields.audioElement.src} controls onEnded={songEnded} />
    </React.Fragment >
  );
});

SingleSongNode.displayName = 'SingleSongNode';

export default SingleSongNode;