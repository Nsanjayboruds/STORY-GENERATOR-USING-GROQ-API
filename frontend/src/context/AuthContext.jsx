import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("token");
    } catch (error) {
      console.error("Failed to read token from storage", error);
      return null;
    }
  });

  const login = useCallback((newToken) => {
    try {
      localStorage.setItem("token", newToken);
      setToken(newToken);
    } catch (error) {
      console.error("Failed to store token", error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("token");
      setToken(null);
    } catch (error) {
      console.error("Failed to remove token", error);
    }
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        setToken(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const value = {
    token,
    login,
    logout,
    isLoggedIn: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};