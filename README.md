# Suggestor

Suggests Spotify playlist based for current playing song

## Setup

This monorepo both includes the Suggestor back-end app and front-end app:

- @suggestor/backend-app
- @suggestor/client

### Building

The whole application build into `packages/backend-app/build`, using `react-scripts` and `tsc`. Before building, make sure all dependencies are installed and that there is a `build` directory in `packages/backend-app/`.

The server is written in TypeScript and is transpiled into JavaScript using `tsc` by running `yarn build` in `packages/backend-app`.

The front-end is built using `react-scripts`, by running `yarn build` in `packages/client`

### Env variables

`server.ts` is using environment variables to connect to the Spotify API.
Add the following env variables to .env file in project root:

- CLIENT_ID (found at https://developer.spotify.com/dashboard/)
- CLIENT_SECRET (found at https://developer.spotify.com/dashboard/)
- REDIRECT_URI (found at https://developer.spotify.com/dashboard/)
- ACCOUNT_API_HOST (https://accounts.spotify.com)
- WEB_API_HOST (https://api.spotify.com)

## Running the frontend locally

The React frontend can be found in `./client` and can be started locally for development, but needs a mocked server to work properly.

- Install dependencies: `yarn install`
- Start FE: `yarn start`

## Running the project w/ server 🏃‍♂️

Run with mocked server and fetch:

- In `./client`, build the frontend with `REACT_APP_MOCK_ENABLED=true` to enable mocked fetch response: `yarn build:mock` (or `build:watch-mock` for watch mode). The FE is now built in `./client/build`.
- In root, run `yarn start:mock`. The node server now runs at `localhost:8888`

Running without mocked server and fetch:

- In `./client`, build the frontend without mocked fetch response: `yarn build` (or `build:watch` for watch mode). The FE is now built in `./client/build`.

* In root, run `yarn start`. The node server now runs at `localhost:8888`
