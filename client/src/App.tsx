import React from "react";
import { useSongState } from "./context/song";
import { useUserState, useUserActions } from "./context/user";

const App = () => {
  const { data } = useUserState();
  const { logIn } = useUserActions();

  return typeof data === "undefined" ? (
    <button onClick={logIn}>Login</button>
  ) : (
    <span>You're logged in</span>
  );
};

export default App;
