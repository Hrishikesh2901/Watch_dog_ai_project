"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
  role: string;
  full_name?: string;
  email?: string;
  mobile_number?: string;
  aadhaar_number?: string;
  age?: number;
  sex?: string;
  date_of_birth?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const res = await axios.get("http://localhost:8000/api/auth/users/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.error("Failed to fetch user", error);
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/token",
        formData
      );
      const { access_token } = res.data;
      localStorage.setItem("token", access_token);
      setToken(access_token);
      const userData = await fetchUser(access_token);
      
      if (userData?.role === 'admin') {
        router.push("/admin");
      } else {
        router.push("/dashboard/user");
      }
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      await axios.post("http://localhost:8000/api/auth/register", {
        username,
        password,
      });
      return true;
    } catch (error) {
      console.error("Registringation failed", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
