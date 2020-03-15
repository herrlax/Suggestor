/**
 * Author: Spotify AB, https://github.com/spotify/web-api-auth-examples
 * Modified by Mikael Malmqvist
 */

require("dotenv").config();
const express = require("express");
const path = require("path");
const request = require("request");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const url = require("url");

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = length => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

const stateKey = "spotify_auth_state";

const app = new express();

app
  .use(express.static(path.join(__dirname, "client/build")))
  .use(cookieParser());

app.get("/auth", (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  const scope =
    "playlist-modify-public playlist-modify-private playlist-read-private user-read-private user-read-currently-playing user-read-playback-state";
  const params = querystring.stringify({
    response_type: "code",
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state
  });

  return res.redirect("https://accounts.spotify.com/authorize?" + params);
});

app.get("/callback", (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch"
        })
    );
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code"
      },
      headers: {
        Authorization:
          "Basic " +
          new Buffer.from(`${client_id}:${client_secret}`).toString("base64")
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        res.cookie("token", body.access_token);
        res.cookie("refresh_token", body.refresh_token);

        const options = {
          url: "https://api.spotify.com/v1/me",
          headers: { Authorization: "Bearer " + body.access_token },
          json: true
        };

        request.get(options, function(error, response, body) {
          res.cookie("user_id", body.id);
          res.redirect("/#");
        });
      } else {
        res.redirect(
          "/#" +
            querystring.stringify({
              error: "invalid_token"
            })
        );
      }
    });
  }
});

// Refreshes access token
app.get("/refresh", (req, res) => {
  let refreshToken = "";

  if (req.headers) {
    refreshToken = req.headers.refreshtoken;
  } else {
    console.log("no header found");
    return;
  }

  if (refreshToken === undefined || refreshToken == "") {
    console.log("refresh token undefined");
    return;
  }

  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      grant_type: "refresh_token",
      refresh_token: refreshToken
    },
    headers: {
      Authorization:
        "Basic " +
        new Buffer.from(`${client_id}:${client_secret}`).toString("base64")
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;

      res.cookie("token", body.access_token);
      res.send({
        access_token
      });
    } else {
      res.redirect(
        "/#" +
          querystring.stringify({
            error: "invalid_token"
          })
      );
    }
  });
});

// Returns the top 3 playlists matching the playing song
app.get("/playlists", (req, res) => {
  let access_token = "";
  let danceability = "";
  let energy = "";
  let speechiness = "";
  let acousticness = "";
  let instrumentalness = "";
  let loudness = "";
  let liveness = "";
  let valence = "";
  let tempo = "";

  if (req.headers) {
    access_token = req.headers.token;
    danceability = req.headers.danceability;
    energy = req.headers.energy;
    speechiness = req.headers.speechiness;
    acousticness = req.headers.acousticness;
    instrumentalness = req.headers.instrumentalness;
    loudness = req.headers.loudness;
    liveness = req.headers.liveness;
    valence = req.headers.valence;
    tempo = req.headers.tempo;
  } else {
    res.send([]);
    return;
  }

  if (access_token === undefined || access_token == "") {
    res.send([]);
    return;
  }

  const opts = {
    url: "https://api.spotify.com/v1/me/playlists",
    headers: { Authorization: "Bearer " + access_token },
    json: true
  };

  request.get(opts, function(error, response, body) {
    // Filters out all playlist that is not user made (i.e that the user can't add to)
    const playlists = body.items.filter(
      p => p.owner.id == req.headers.userid && p.tracks.total > 0
    );

    let valueLists = [];

    // Calculates average track values for each playlist
    const ps = playlists.map(playlist => {
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
          json: true
        };

        request.get(opts3, function(error, response, body) {
          if (body.items == null || body.items == undefined) {
            console.log("no items found in playlist..");
            return null;
          }

          // Creates array of only ids for all tracks
          const tIds = body.items.map(i => {
            return i.track.id;
          });

          const opts2 = {
            url: url.resolve(
              "https://api.spotify.com/v1/audio-features/",
              "?ids=" + encodeURIComponent(tIds.join(","))
            ),
            headers: { Authorization: "Bearer " + access_token },
            json: true
          };

          request.get(opts2, function(error, response, body) {
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
                values.forEach(v => {
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
              valence: avrValence
            });

            resolve();
          });
        });
      }).then(function(val) {
        return val;
      });
    });

    Promise.all(ps).then(
      function(values) {
        const matches = valueLists.map(p => {
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
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

console.log("Listening on 8888");
app.listen(8888);
