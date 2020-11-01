import React, { createContext, useEffect, useContext, useMemo, useReducer } from "react";
import { useHistory } from "react-router-dom";
import * as Cookies from "es-cookie";
// import PropTypes from "prop-types";
import { useHttpClient } from "../../utils/httpClient";

export type UserData = {
  token?: string;
  refreshToken?: string;
  userId?: string;
};

type State = {
  data?: UserData;
  getInitialUserData: {
    isLoading: boolean;
    isSuccess: boolean;
  };
  getRefreshedAccessToken: {
    isLoading: boolean;
    isSuccess: boolean;
    isErrored: boolean;
  };
};

const initialState: State = {
  data: undefined,
  getInitialUserData: {
    isLoading: false,
    isSuccess: false
  },
  getRefreshedAccessToken: {
    isLoading: false,
    isSuccess: false,
    isErrored: false
  }
};

type Actions = {
  logIn: () => void;
  refreshAccessToken: () => void;
};

const UserStateContext = createContext<State | undefined>(undefined);
const UserActionContext = createContext<Actions | undefined>(undefined);

type ActionTypes =
  | { type: "get_initial_user_data_init" }
  | { type: "get_initial_user_data_success"; userData?: UserData }
  | { type: "get_initial_user_data_error" }
  | { type: "get_initial_user_data_reset_error" }
  | { type: "refresh_access_token_init" }
  | { type: "refresh_access_token_success"; token: string }
  | { type: "refresh_access_token_error" };

const reducer = (state: State, action: ActionTypes): State => {
  switch (action.type) {
    case "get_initial_user_data_init":
      return {
        ...state,
        getInitialUserData: {
          isLoading: true,
          isSuccess: false
        }
      };
    case "get_initial_user_data_success":
      return {
        ...state,
        data: action.userData,
        getInitialUserData: {
          isLoading: false,
          isSuccess: true
        }
      };
    case "refresh_access_token_init":
      return {
        ...state,
        getRefreshedAccessToken: {
          isLoading: true,
          isSuccess: false,
          isErrored: false
        }
      };
    case "refresh_access_token_success":
      return {
        ...state,
        data: {
          ...state.data,
          token: action.token
        },
        getRefreshedAccessToken: {
          isLoading: false,
          isSuccess: true,
          isErrored: false
        }
      };
    case "refresh_access_token_error":
      return {
        ...state,
        getRefreshedAccessToken: {
          isLoading: false,
          isSuccess: false,
          isErrored: true
        }
      };
    default:
      throw new Error("Unsupported action");
  }
};

const UserProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const history = useHistory();
  const { getRefreshedAccessToken } = useHttpClient(state.data);

  useEffect(() => {
    dispatch({ type: "get_initial_user_data_init" });
  }, []);

  useEffect(() => {
    if (state.getInitialUserData.isLoading) {
      const token = Cookies.get("token");
      const refreshToken = Cookies.get("refresh_token");
      const userId = Cookies.get("user_id");

      if (!token || !refreshToken || !userId) {
        dispatch({
          type: "get_initial_user_data_success",
          userData: undefined
        });
      } else {
        dispatch({
          type: "get_initial_user_data_success",
          userData: {
            token,
            refreshToken,
            userId
          }
        });
      }
    }
  }, [state.getInitialUserData.isLoading]);

  useEffect(() => {
    const refreshToken = async () => {
      if (state.getRefreshedAccessToken.isLoading) {
        try {
          const token = await getRefreshedAccessToken();
          dispatch({ type: "refresh_access_token_success", token });
        } catch (e) {
          dispatch({ type: "refresh_access_token_error" });
        }
      }
    };

    refreshToken();
  }, [state.getRefreshedAccessToken.isLoading, getRefreshedAccessToken]);

  useEffect(() => {
    if (state.getRefreshedAccessToken.isErrored) {
      console.error("Failed refreshing access token..");
    }
  }, [state.getRefreshedAccessToken.isErrored]);

  const actions = useMemo(
    () => ({
      refreshAccessToken: () => {
        dispatch({ type: "refresh_access_token_init" });
      },
      logIn: () => {
        history.push("/auth");
      }
    }),
    [history]
  );

  return (
    <UserStateContext.Provider value={state}>
      <UserActionContext.Provider value={actions}>{children}</UserActionContext.Provider>
    </UserStateContext.Provider>
  );
};

const useUserState = () => {
  const context = useContext(UserStateContext);

  if (!context) {
    throw new Error("Please wrap component in UserProvider to use useUserState");
  }

  return context;
};

const useUserActions = () => {
  const context = useContext(UserActionContext);

  if (!context) {
    throw new Error("Please wrap component in UserProvider to use useUserActions");
  }

  return context;
};

// UserProvider.propTypes = {
//   children: PropTypes.node,
// };

export { UserProvider, useUserState, useUserActions };
