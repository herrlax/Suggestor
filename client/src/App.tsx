import React from "react";
import { useSongState } from "./context/song";
import { useUserState, useUserActions } from "./context/user";

const App = () => {
  // const { currentSong } = useSongState();
  const { data } = useUserState();
  const { logIn } = useUserActions();

  return <>{typeof data === "undefined" && <button onClick={logIn}>Login</button>}</>;
  // return <>Current song: {currentSong && currentSong.name}</>;
};

export default App;
