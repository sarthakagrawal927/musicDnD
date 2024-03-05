
import { SongFields } from '@/types';
import Image from 'next/image';
import React, { PropsWithChildren } from 'react';

const SingleSongNode = (songFields: SongFields & PropsWithChildren) => {
  return (
    <div className="border border-transparent px-2 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 align-middle justify-center flex items-center">
      {songFields.cover && <Image src={songFields.cover} alt={songFields.title} width={100} height={100} />}
    </div >
  );
};

export default SingleSongNode;