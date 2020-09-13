import React from "react";
import { useSongState } from "./context/song";
import { useUserState, useUserActions } from "./context/user";
import NowPlaying from "./components/NowPlaying";

const App = () => {
  const { data: userData } = useUserState();
  const { logIn } = useUserActions();

  return typeof userData === "undefined" ? (
    <button onClick={logIn}>Login</button>
  ) : (
    <NowPlaying />
  );
};

export default App;
