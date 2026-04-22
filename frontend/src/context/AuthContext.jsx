import { createContext, useMemo, useState } from 'react';

export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const isAuthenticated = Boolean(user);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      login: (userData) => setUser(userData),
      logout: () => setUser(null),
    }),
    [user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
