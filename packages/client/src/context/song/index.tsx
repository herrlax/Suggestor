import React, { useMemo, useReducer, useEffect, useContext, useRef } from "react";
import { useHttpClient, Song } from "../../utils/httpClient";
import { useUserState, useUserActions } from "../user";

// type AnalyzedSong = {
//   id: string;
//   title: string;
//   artist: string;
//   image: string;
//   uri: string;
//   acousticness: number;
//   danceability: number;
//   energy: number;
//   instrumentalness: number;
//   liveness: number;
//   loudness: number;
//   love: number;
//   speechiness: number;
//   tempo: number;
//   valence: number;
// };

type Actions = {
  getCurrentSong: () => void;
};

type State = {
  currentSong?: Song;
  getCurrentSong: {
    isLoading: boolean;
    isSuccess: boolean;
    isErrored: boolean;
  };
};

const initialState = {
  currentSong: undefined,
  getCurrentSong: {
    isLoading: false,
    isSuccess: false,
    isErrored: false
  }
};

const SongActionContext = React.createContext<Actions | undefined>(undefined);
const SongStateContext = React.createContext<State | undefined>(undefined);

type ActionTypes =
  | { type: "get_current_song_init" }
  | { type: "get_current_song_success"; song: Song }
  | { type: "get_current_song_error" };

const reducer = (state: State, action: ActionTypes): State => {
  switch (action.type) {
    case "get_current_song_init":
      return {
        ...state,
        getCurrentSong: {
          isLoading: true,
          isSuccess: false,
          isErrored: false
        }
      };
    case "get_current_song_success":
      return {
        currentSong: action.song.id ? action.song : undefined,
        getCurrentSong: {
          isLoading: false,
          isSuccess: true,
          isErrored: false
        }
      };
    case "get_current_song_error":
      return {
        ...state,
        getCurrentSong: {
          isLoading: false,
          isSuccess: false,
          isErrored: true
        }
      };
    default:
      throw new Error("Unsupported action");
  }
};

const SongProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { data: userData } = useUserState();
  const { refreshAccessToken } = useUserActions();
  const { fetchCurrentSong, fetchPlaylists } = useHttpClient(userData);

  useEffect(() => {
    const getSong = async () => {
      if (state.getCurrentSong.isLoading) {
        try {
          const song = await fetchCurrentSong();
          dispatch({ type: "get_current_song_success", song });
          // eslint-disable-next-line no-console
          console.log("success!", song);

          if (song.id) {
            await fetchPlaylists(song.id);
          }
        } catch (e) {
          if (e.status === 401) {
            // The access token expired
            dispatch({ type: "get_current_song_error" });
          }
        }
      }
    };

    getSong();
  }, [state.getCurrentSong.isLoading, fetchCurrentSong, fetchPlaylists]);

  useEffect(() => {
    if (state.getCurrentSong.isErrored) {
      refreshAccessToken();
    }
  }, [refreshAccessToken, state.getCurrentSong.isErrored]);

  const actions = useMemo(() => {
    return {
      getCurrentSong: () => {
        dispatch({ type: "get_current_song_init" });
      }
    };
  }, []);

  return (
    <SongActionContext.Provider value={actions}>
      <SongStateContext.Provider value={state}>{children}</SongStateContext.Provider>
    </SongActionContext.Provider>
  );
};

const useSongActions = () => {
  const context = useContext(SongActionContext);

  if (!context) {
    throw new Error("Please wrap component in SongProvider to use useSongAction");
  }

  return context;
};

const useSongState = () => {
  const context = useContext(SongStateContext);

  if (!context) {
    throw new Error("Please wrap component in SongProvider to use useSongState");
  }

  return context;
};

const SongHandler = () => {
  const intervalStarted = useRef(false);
  const { data: userData } = useUserState();
  const { getCurrentSong } = useSongActions();

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (userData && !intervalStarted.current) {
      getCurrentSong();

      interval = setInterval(getCurrentSong, 60000);
      intervalStarted.current = true;
    }

    return () => {
      if (typeof interval !== "undefined") {
        clearInterval(interval);
      }
    };
  }, [getCurrentSong, userData]);

  return null;
};

export { SongProvider, SongHandler, useSongActions, useSongState };
