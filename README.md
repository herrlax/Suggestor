# Suggestor
Suggests Spotify playlist based for current playing song

## Setup
 
`Server.js` is using environment variables to connect to the Spotify API.
Add the following env variables to .env file in project root:
- CLIENT_ID
- CLIENT_SECRET
- REDIRECT_URI

## Running the frontend locally

The React frontend can be found in `./client` and can be started locally for development, but needs a mocked server to work properly.
- Install dependencies: `yarn install`
- Start FE: `yarn start`

## Running the project w/ server 🏃‍♂️

Run with mocked server and fetch: 
-  In `./client`, build the frontend with `REACT_APP_MOCK_ENABLED=true` to enable mocked fetch response: `yarn build:mock` (or `build:watch-mock` for watch mode). The FE is now built in `./client/build`.
- In root, run `yarn start:mock`. The node server now runs at `localhost:8888` 

Running without mocked server and fetch:
-  In `./client`, build the frontend without mocked fetch response: `yarn build` (or `build:watch` for watch mode). The FE is now built in `./client/build`.
* In root, run `yarn start`. The node server now runs at `localhost:8888` 