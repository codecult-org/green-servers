"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface User {
  email: string;
  exp: number;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      validateToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = (token: string) => {
    try {
      const decoded = jwtDecode<User>(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        handleLogout();
      } else {
        setUser(decoded);
        setIsAuthenticated(true);
      }
    } catch (error) {
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token: string) => {
    localStorage.setItem("token", token);
    validateToken(token);
    router.push("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  const logout = () => {
    handleLogout();
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
