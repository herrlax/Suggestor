import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { UserProvider } from "./context/user";
import { SongHandler, SongProvider } from "./context/song";

ReactDOM.render(
  <BrowserRouter forceRefresh>
    <UserProvider>
      <SongProvider>
        <SongHandler />
        <App />
      </SongProvider>
    </UserProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
