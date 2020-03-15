const spotifyApi = "https://api.spotify.com/v1";

export type Song = {
  id: string;
  name: string;
  artists: string[];
};

export const useHttpClient = ({
  token,
  refreshToken,
  userid
}: {
  token?: string;
  refreshToken?: string;
  userid?: string;
}) => {
  const fetchCurrentSong = async () => {
    const endpoint = `${spotifyApi}/me/player/currently-playing`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
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

  const getRefreshedAccessToken = async () => {
    const res = await fetch("/refresh", {
      method: "GET",
      headers: {
        refreshToken: refreshToken || "",
        userid: userid || ""
      }
    });

    const resJson = await res.json();
    return await resJson.access_token;
  };

  return { fetchCurrentSong, getRefreshedAccessToken };
};