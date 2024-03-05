import { Source } from "@/constants";
import { RefObject } from "react";

export type SongFields = {
  title: string;
  cover: string;
  artist: string;
  audioElement: HTMLAudioElement;
}

export type BoxElement<T> = {
  uniqueKey: string;
  componentFields: T
  ref: RefObject<HTMLDivElement>;
  source: Source;
  element: (props: T) => React.JSX.Element;
};

type YoutubeFields = {}