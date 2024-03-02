import React, { useEffect } from 'react';
import Image from 'next/image';
import jsonmediatags from "./jsmediatags.js";

type SingleSongNodeProps = {
  blob: Blob;
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

const SingleSongNode: React.FC<SingleSongNodeProps> = ({ blob }) => {

  const getCoverImageUrl = (data: number[]): string => {
    const byteArray = new Uint8Array(data);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    return url;
  }

  useEffect(() => {
    const blobUrl = URL.createObjectURL(blob);
    const audio = new Audio(blobUrl);
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

  return (
    <>
      {songFields.cover && <Image src={songFields.cover} alt={songFields.title} width={50} height={50} />}
      <p>{songFields.title} by {songFields.artist}</p>
    </>
  );
};

export default SingleSongNode;