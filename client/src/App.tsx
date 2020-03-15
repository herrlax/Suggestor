import React from "react";
import { useSongState } from "./context/song";

const App = () => {
  const { currentSong } = useSongState();

  return <>Current song: {currentSong && currentSong.name}</>;
};

export default App;
