import * as Cookies from "es-cookie";
import fetchMock from "fetch-mock";

const clearCookies = () => {
  Cookies.remove("token");
  Cookies.remove("refresh_token");
  Cookies.remove("user_id");
};

const token = Cookies.get("token");
const refreshToken = Cookies.get("refresh_token");
const userId = Cookies.get("user_id");

if (process.env.REACT_APP_MOCK_ENABLED) {
  if (
    (token !== "MOCK_TOKEN" && token !== "NEW_MOCK_TOKEN") ||
    refreshToken !== "MOCK_REFRESH_TOKEN" ||
    userId !== "MOCK_USER_ID"
  ) {
    clearCookies();
  }

  // eslint-disable-next-line global-require
  (window as any).fetch = require("fetch-mock");

  fetchMock.get("https://api.spotify.com/v1/me/player/currently-playing", {
    item: {
      id: "12345",
      name: "Fly me to the moon",
      artists: ["Frank Sinatra"]
    }
  });
} else if (
  token === "MOCK_TOKEN" ||
  token === "NEW_MOCK_TOKEN" ||
  refreshToken === "MOCK_REFRESH_TOKEN" ||
  userId === "MOCK_USER_ID"
) {
  clearCookies();
}

export {};
