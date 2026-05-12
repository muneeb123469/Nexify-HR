import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const API_URL = "http://localhost:5000/api";
  const isAuthenticated = () => {
    return !!user;
  };
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Load user from localStorage on initial mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (email, password, role) => {
    try {
      const trimmedEmail = email.trim();

      console.log("Attempting login:", {
        email: trimmedEmail,
        role,
        hasPassword: !!password,
      });

      const response = await axios.post(`${API_URL}/auth/login`, {
        email: trimmedEmail,
        password,
        role,
      });

      if (response.data.token && response.data.user) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", response.data.token);
        return userData;
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed";
      console.error("Login error:", {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
        error: err,
      });
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      if (!userData.username || !userData.email || !userData.password) {
        throw new Error("Please fill in all required fields");
      }

      if (userData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      if (userData.username.length < 3) {
        throw new Error("Username must be at least 3 characters long");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error("Please provide a valid email address");
      }

      const response = await axios.post(`${API_URL}/auth/register`, userData);

      if (response.data.token && response.data.user) {
        const newUser = response.data.user;
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        localStorage.setItem("token", response.data.token);
        return newUser;
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Registration failed";
      console.error("Registration error:", {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
      });
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isAuthenticated, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};
