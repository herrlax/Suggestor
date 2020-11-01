import React from "react";
import "./utils/mock.ts";
import { useUserState, useUserActions } from "./context/user";
import NowPlaying from "./components/NowPlaying";

const App = () => {
  const { data: userData } = useUserState();
  const { logIn } = useUserActions();

  return typeof userData === "undefined" ? (
    <button onClick={logIn} type="button">
      Login
    </button>
  ) : (
    <NowPlaying />
  );
};

export default App;
