import React, { createContext, useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import * as Cookies from "es-cookie";

type User = {
  token?: string;
  refreshToken?: string;
  userId?: string;
};

type State = {
  data: User;
};

const UserContext = createContext<State | undefined>(undefined);

const UserProvider: React.FC = ({ children }) => {
  const history = useHistory();
  const [user, setUser] = useState<User>({
    token: "",
    refreshToken: "",
    userId: ""
  });

  useEffect(() => {
    const token = Cookies.get("token");
    const refreshToken = Cookies.get("refresh_token");
    const userId = Cookies.get("user_id");

    if (!token || !refreshToken || !userId) {
      history.push("/auth");
    }

    setUser({
      token: token,
      refreshToken: refreshToken,
      userId: userId
    });
  }, []);

  return (
    <UserContext.Provider value={{ data: user }}>
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("You must use UserProvider to use useUser");
  }

  return context;
};

export { UserProvider, useUser };
