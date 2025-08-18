"use client";
import { usersCurrentUser } from "@/app/clientService"; // Assuming this function verifies the user
import React, { createContext, useContext, useEffect, useState } from "react";
import { logout as logoutAction } from "./actions/logout-action";
import { configureClient } from "@/lib/clientConfig";
interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  loginSuccess: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  token: string | undefined;
}> = ({ children, token }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  if (token) {
    configureClient(token);
  }

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const { error } = await usersCurrentUser({
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!error) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Verification error:", err);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const logout = async () => {
    const result = await logoutAction();
    if (result.success) {
      setIsAuthenticated(false);
      window.location.href = "/login"; // Redirect after updating state
    } else {
      console.error(result.message);
    }
  };

  const loginSuccess = async () => {
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loading, logout, loginSuccess }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
