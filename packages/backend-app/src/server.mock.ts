import express from "express";
import path from "path";
import cookieParser from "cookie-parser";

const app = express();
const cwd = process.cwd();

console.log("cwd", cwd);
console.log("__dirname", __dirname);

// mark client/build as a static assets directory
app.use(express.static(path.resolve(cwd) + "/build/client"));

app.use(cookieParser());

app.get("/auth", (req, res) => {
  res.cookie("token", "MOCK_TOKEN");
  res.cookie("refresh_token", "MOCK_REFRESH_TOKEN");
  res.cookie("user_id", "MOCK_USER_ID");
  res.redirect("/");
});

app.get("/refresh", (req: any, res: any) => {
  if (typeof req.headers === "undefined") {
    throw new Error("Request is missing header");
  }

  const { refreshToken } = req.headers.refreshtoken;

  if (typeof refreshToken === "undefined" || refreshToken === "") {
    throw new Error("Undefined refresh token");
  }

  res.cookie("token", "NEW_MOCK_TOKEN");

  res.send({
    access_token: "NEW_MOCK_TOKEN"
  });
});

// Returns the top 3 playlists matching the playing song
app.get("/playlists", (req: any, res: any) => {
  if (typeof req.header === "undefined" || req.header === {}) {
    throw new Error("Request is missing header");
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
    throw new Error("Undefined access token");
  }

  return [];
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(cwd) + "/build/client/index.html");
});

console.log("Listening on 8888");
app.listen(8888);
