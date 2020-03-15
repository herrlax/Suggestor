import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/user";
import { SongProvider, SongHandler } from "./context/song";

ReactDOM.render(
  <BrowserRouter forceRefresh={true}>
    <UserProvider>
      <SongProvider>
        <App />
        <SongHandler />
      </SongProvider>
    </UserProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
