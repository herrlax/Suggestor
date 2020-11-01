import React from "react";
import { useSongState } from "../../context/song";

const NowPlaying: React.FC = () => {
  const { currentSong } = useSongState();

  console.log("currentSong", currentSong);

  return !currentSong ? <h2>Nothing playing</h2> : <h2>Currently playing {currentSong.name}</h2>;
};

export default NowPlaying;
