import React, { useEffect } from 'react';
import jsonmediatags from "../components/jsmediatags.js";

export type SongFields = {
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

const getCoverImageUrl = (data: number[]): string => {
  const byteArray = new Uint8Array(data);
  const blob = new Blob([byteArray], { type: 'image/jpeg' });
  const url = URL.createObjectURL(blob);
  return url;
}

const useGetSongTags = ({blob}: {blob: Blob}) => {
  useEffect(() => {
    const blobUrl = URL.createObjectURL(blob);
    const audio = new Audio(blobUrl);
    jsonmediatags.read(blob, {
      onSuccess: function ({ tags }: { tags: JsonMediaTags }) {
        const imageUrl = getCoverImageUrl(tags.picture.data);
        setSongFields((prev) => ({
          ...prev,
          audioElement: audio,
          cover: imageUrl,
          title: tags.title,
          artist: tags.artist
        }));
      },
    })
  }, [blob]);

  const [songFields, setSongFields] = React.useState<SongFields>({
    title: '',
    cover: '',
    audioElement: new Audio(),
    artist: '',
  });

  return [songFields];
};

export const getSongTags = async (blob: Blob): Promise<SongFields> => {
  return new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(blob);
    const audio = new Audio(blobUrl);

    jsonmediatags.read(blob, {
      onSuccess: function ({ tags }: { tags: JsonMediaTags }) {
        const imageUrl = getCoverImageUrl(tags.picture.data);
        const songFields: SongFields = {
          title: tags.title,
          cover: imageUrl,
          audioElement: audio,
          artist: tags.artist,
        };
        resolve(songFields);
      },
      onError: function (error: any) {
        reject(error);
      },
    });
  });
};

export default useGetSongTags;