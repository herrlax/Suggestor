import { UserData } from "../context/user";

const spotifyApi = "https://api.spotify.com/v1";

export type Song = {
  id: string;
  name: string;
  artists: string[];
};

export const useHttpClient = (user?: UserData) => {
  const fetchCurrentSong = async () => {
    const endpoint = `${spotifyApi}/me/player/currently-playing`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${user?.token}`
      }
    });

    if (!res || typeof res === "undefined" || res.status === 204) {
      return {
        id: "",
        name: "",
        artists: []
      };
    }

    const song = await res.json();

    if (song.error) {
      throw song.error;
    }

    return {
      id: song.item.id,
      name: song.item.name,
      artists: song.item.artists.map((a: any) => a.name)
    };
  };

  const fetchPlaylists = async (songId: string) => {
    if (typeof user === "undefined") {
      throw new Error("User undefined");
    }

    if (!user.token) {
      throw new Error("Missing access token");
    }

    console.log("songId", songId);

    const res = await fetch("/playlists", {
      headers: {
        song: songId,
        token: user.token
      }
    });

    const resJson = await res.json();

    // eslint-disable-next-line no-console
    console.log("resJson", resJson);
  };

  const getRefreshedAccessToken = async () => {
    const res = await fetch("/refresh", {
      method: "GET",
      headers: {
        refreshToken: user?.refreshToken || "",
        userid: user?.userId || ""
      }
    });

    const resJson = await res.json();

    return resJson.access_token;
  };

  return { fetchCurrentSong, fetchPlaylists, getRefreshedAccessToken };
};
