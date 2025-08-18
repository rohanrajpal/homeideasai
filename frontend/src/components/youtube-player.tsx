"use client";

import YouTubePlayer from "react-player/youtube";

export const YoutubePlayer = ({ url }: { url: string }) => {
  return <YouTubePlayer url={url} controls={true} />;
};
