require("dotenv").config();
const express = require("express");
const path = require("path");
const request = require("request");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const url = require("url");

const app = new express();

app
  .use(express.static(path.join(__dirname, "client/build")))
  .use(cookieParser());

app.get("/auth", (req, res) => {
  res.cookie("token", "MOCK_TOKEN");
  res.cookie("refresh_token", "MOCK_REFRESH_TOKEN");
  res.cookie("user_id", "MOCK_USER_ID");
  res.redirect("/home");
});

app.get("/refresh", (req, res) => {
  let refreshToken = "";

  if (req.headers) {
    refreshToken = req.headers.refreshtoken;
  } else {
    throw new Error("Request is missing header")
  }

  if (typeof refreshToken === "undefined" || refreshToken === "") {
    throw new Error("Undefined refresh token")
  }

  res.cookie("token", "NEW_MOCK_TOKEN");

  res.send({
    access_token:  "NEW_MOCK_TOKEN"
  });
});

// Returns the top 3 playlists matching the playing song
app.get("/playlists", (req, res) => {
  if(typeof req.header === "undefined" || req.header === {}) {
    throw new Error("Request is missing header")
  }

  const { 
    access_token,
    danceability,
    energy,
    speechiness,
    acousticness,
    instrumentalness,
    loudness,
    liveness,
    valence,
    tempo
  } = req.header;

  if (typeof access_token === "undefined" || access_token == "") {
    throw new Error("Undefined access token")
  }

  return [];
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

console.log("Listening on 8888");
app.listen(8888);
