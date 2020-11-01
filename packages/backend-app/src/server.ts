/**
 * Author: Spotify AB, https://github.com/spotify/web-api-auth-examples
 * Modified by Mikael Malmqvist
 */

import axios from "axios";
import express from "express";
// const express = require("express");
import path from "path";
/**
 * @TODO Replace all use of request with axios as request is depricated
 */
import request from "request";

import querystring from "querystring";
import cookieParser from "cookie-parser";
import url from "url";

import dotenv from "dotenv";

dotenv.config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
const accountApiHost = process.env.ACCOUNT_API_HOST;
const webApiHost = process.env.WEB_API_HOST;

if (!clientId) {
  throw new Error("No CLIENT_ID found. Please specify CLIENT_ID in your local .env file");
}

if (!clientSecret) {
  throw new Error("No CLIENT_SECRET found. Please specify CLIENT_SECRET in your local .env file");
}

if (!redirectUri) {
  throw new Error("No REDIRECT_URI found. Please specify REDIRECT_URI in your local .env file");
}

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = (length: number) => {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

const stateKey = "spotify_auth_state";
const applicationScope =
  "playlist-modify-public playlist-modify-private playlist-read-private user-read-private user-read-currently-playing user-read-playback-state";

const app = express();

app.use(express.static(path.join(__dirname, "client/build"))).use(cookieParser());

app.get("/auth", (req: any, res: any) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  const params = querystring.stringify({
    response_type: "code",
    client_id: clientId,
    scope: applicationScope,
    redirect_uri: redirectUri,
    state
  });

  return res.redirect(`${accountApiHost}/authorize?${params}`);
});

app.get("/callback", async (req: any, res: any) => {
  const { code, state } = req.query;
  const storedState = req.cookies && req.cookies[stateKey];

  if (typeof state === "undefined" || state !== storedState) {
    res.redirect(
      `/#${querystring.stringify({
        error: "state_mismatch"
      })}`
    );
    return;
  }

  res.clearCookie(stateKey);

  const authOptions = {
    form: {
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    },
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`
    },
    json: true
  };

  try {
    const response = await axios.post(`${accountApiHost}/api/token`, authOptions);

    console.log("response!!!!", response);

    if (response.status === 200) {
      // all good
    }
  } catch (e) {
    console.log("caught here..");

    // do nothing
  }

  // request.post(authOptions, function (error, response, body) {
  //   if (!error && response.statusCode === 200) {
  //     res.cookie("token", body.access_token);
  //     res.cookie("refresh_token", body.refresh_token);

  //     const options = {
  //       url: `${web_api_host}/v1/me`,
  //       headers: { Authorization: "Bearer " + body.access_token },
  //       json: true,
  //     };

  //     request.get(options, function (error, response, body) {
  //       res.cookie("user_id", body.id);
  //       res.redirect("/#");
  //     });
  //   } else {
  //     res.redirect(
  //       "/#" +
  //         querystring.stringify({
  //           error: "invalid_token",
  //         })
  //     );
  //   }
  // });
});

// Refreshes access token
app.get("/refresh", (req, res) => {
  const { refreshToken } = req.headers;

  if (!refreshToken) {
    console.log("refresh token undefined");
    return;
  }

  const authOptions = {
    url: `${accountApiHost}/api/token`,
    form: {
      grant_type: "refresh_token",
      refresh_token: refreshToken
    },
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      const { access_token: accessToken } = body;

      res.cookie("token", accessToken);
      res.send({
        access_token: accessToken
      });
    } else {
      res.redirect(
        `/#${querystring.stringify({
          error: "invalid_token"
        })}`
      );
    }
  });
});

const getSongFeatures = async (songId: string, token: string) => {
  return axios
    .get(`${webApiHost}/v1/audio-features/${songId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((response) => response.data);
};

/**
 * Returns the top 3 playlists matching the playing song
 * @TODO just take song id
 */
app.get("/playlists", async (req, res) => {
  // let access_token = "";
  // let danceability = "";
  // let energy = "";
  // let speechiness = "";
  // let acousticness = "";
  // let instrumentalness = "";
  // let loudness = "";
  // let liveness = "";
  // let valence = "";
  // let tempo = "";

  // if (req.headers) {
  // access_token = req.headers.token;
  // danceability = req.headers.danceability;
  // energy = req.headers.energy;
  // speechiness = req.headers.speechiness;
  // acousticness = req.headers.acousticness;
  // instrumentalness = req.headers.instrumentalness;
  // loudness = req.headers.loudness;
  // liveness = req.headers.liveness;
  // valence = req.headers.valence;
  // tempo = req.headers.tempo;
  // } else {
  //   res.send([]);
  //   return;
  // }

  if (!req.headers) {
    res.send([]);
    return;
  }

  const { song, token } = req.headers;

  if (!token || !song || typeof song !== "string" || typeof token !== "string") {
    res.send([]);
    return;
  }

  const songFeatures = await getSongFeatures(song, token);

  res.send([]);
  // const opts = {
  //   url: "https://api.spotify.com/v1/me/playlists",
  //   headers: { Authorization: "Bearer " + access_token },
  //   json: true,
  // };

  /*
  request.get(opts, function (error, response, body) {
    // Filters out all playlist that is not user made (i.e that the user can't add to)
    const playlists = body.items.filter(
      (p) => p.owner.id == req.headers.userid && p.tracks.total > 0
    );

    let valueLists = [];

    // Calculates average track values for each playlist
    const ps = playlists.map((playlist) => {
      return new Promise((resolve, reject) => {
        // Calculating needed sample size for the given population size
        // for a 95% confidence level with 5% margin of error
        const z = 1.96; // 95% confidence level
        const moe = 0.05; // 5% confidence interval (margin of error)
        const p = 0.5; // 50% population proportion
        const popSize = playlist.tracks.total; // population size

        // sample needed for unlimited population
        const n = (z * z * p * (1 - p)) / (moe * moe);

        // sample needed for limited population
        const sampleSize =
          popSize <= 10
            ? popSize
            : Math.ceil(
                n / (1 + (z * z * p * (1 - p)) / (moe * moe * popSize))
              );

        const imageUrl =
          playlist.images[0] !== null ? playlist.images[0].url : "";
        const ownerId = playlist.owner.id;
        const titleShort = playlist.name.substring(0, 19);

        const opts3 = {
          url: url.resolve(
            "https://api.spotify.com/v1/users/",
            encodeURIComponent(playlist.owner.id) +
              "/playlists/" +
              encodeURIComponent(playlist.id) +
              "/tracks?limit=" +
              sampleSize
          ),
          headers: { Authorization: "Bearer " + access_token },
          json: true,
        };

        request.get(opts3, function (error, response, body) {
          if (body.items == null || body.items == undefined) {
            console.log("no items found in playlist..");
            return null;
          }

          // Creates array of only ids for all tracks
          const tIds = body.items.map((i) => {
            return i.track.id;
          });

          const opts2 = {
            url: url.resolve(
              "https://api.spotify.com/v1/audio-features/",
              "?ids=" + encodeURIComponent(tIds.join(","))
            ),
            headers: { Authorization: "Bearer " + access_token },
            json: true,
          };

          request.get(opts2, function (error, response, body) {
            let avrDanceability = 0,
              avrEnergy = 0,
              avrLoudness = 0,
              avrSpeechiness = 0,
              avrAcousticness = 0,
              avrInstrumentalness = 0,
              avrLiveness = 0,
              avrValence = 0,
              avrTempo = 0;

            if (body != null) {
              const values = body.audio_features;

              if (values != null) {
                // Sums all average attributes
                values.forEach((v) => {
                  if (v != null) {
                    avrDanceability += v.danceability;
                    avrEnergy += v.energy;
                    // avrLoudness += v.loudness;
                    avrSpeechiness += v.speechiness;
                    avrAcousticness += v.acousticness;
                    avrInstrumentalness += v.instrumentalness;
                    avrLiveness += v.liveness;
                    avrValence += v.valence;
                    // avrTempo += v.tempo;
                  }
                });

                avrDanceability = avrDanceability / values.length;
                avrEnergy = avrEnergy / values.length;
                // avrLoudness = avrLoudness / values.length;
                avrSpeechiness = avrSpeechiness / values.length;
                avrAcousticness = avrAcousticness / values.length;
                avrInstrumentalness = avrInstrumentalness / values.length;
                avrLiveness = avrLiveness / values.length;
                avrValence = avrValence / values.length;
                avrLoudness = avrLoudness / values.length;
                // avrTempo = avrTempo / values.length;
              }
            }

            valueLists.push({
              size: popSize,
              image: imageUrl,
              userId: ownerId,
              name: titleShort,
              id: playlist.id,
              danceability: avrDanceability,
              energy: avrEnergy,
              // loudness: avrLoudness,
              speechiness: avrSpeechiness,
              acousticness: avrAcousticness,
              instrumentalness: avrInstrumentalness,
              liveness: avrLiveness,
              // tempo: avrTempo,
              valence: avrValence,
            });

            resolve();
          });
        });
      }).then(function (val) {
        return val;
      });
    });

    Promise.all(ps).then(
      function (values) {
        const matches = valueLists.map((p) => {
          p.value =
            Math.abs(danceability - p.danceability) +
            Math.abs(energy - p.energy) +
            Math.abs(speechiness - p.speechiness) +
            Math.abs(acousticness - p.acousticness) +
            Math.abs(instrumentalness - p.instrumentalness) +
            //+ Math.abs((Math.abs(loudness) - Math.abs(p.loudness)))
            Math.abs(liveness - p.liveness) +
            //+ Math.abs(tempo-p.tempo)
            Math.abs(valence - p.valence);

          return p;
        });

        matches.sort((p1, p2) => {
          if (p1.value < p2.value) {
            return -1;
          } else if (p1.value > p2.value) {
            return 1;
          } else {
            return 0;
          }
        });

        res.send(matches.slice(0, 3));
      }.bind(this)
    );
  });
  */
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

console.log("Listening on 8888");
app.listen(8888);
