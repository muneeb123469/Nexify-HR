import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = 'http://localhost:5000/api';

  // Load user from localStorage on initial mount
  // useEffect(() => {
  //   const storedUser = localStorage.getItem('user');
  //   if (storedUser) {
  //     try {
  //       const parsedUser = JSON.parse(storedUser);
  //       setUser(parsedUser);
  //     } catch (error) {
  //       console.error('Error parsing stored user:', error);
  //       localStorage.removeItem('user');
  //     }
  //   }
  //   setLoading(false);
  // }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Set axios default header for restored sessions
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    // Add axios response interceptor to handle token expiration globally
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          const errorCode = error.response?.data?.code;
          if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_INVALID' || errorCode === 'NO_TOKEN') {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    setLoading(false);

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);
  const login = async (email, password) => {
    try {
      setError(null);

      // Validate input
      if (!email || !password) {
        throw new Error('Please provide both email and password');
      }

      // Trim and lowercase email
      const trimmedEmail = email.trim().toLowerCase();

      console.log('Attempting login:', {
        email: trimmedEmail,
        hasPassword: !!password
      });

      const response = await axios.post(`${API_URL}/auth/login`, {
        email: trimmedEmail,
        password
      });

      if (response.data.token && response.data.user) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.token);

        // Set default authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        console.log('Login successful:', {
          user: userData,
          hasToken: !!response.data.token
        });

        return userData;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      console.error('Login error:', {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
        error: err
      });
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);

      // Client-side validation
      if (!userData.username || !userData.email || !userData.password) {
        throw new Error('Please fill in all required fields');
      }

      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (userData.username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Please provide a valid email address');
      }

      const response = await axios.post(`${API_URL}/auth/register`, userData);

      if (response.data.token && response.data.user) {
        const newUser = response.data.user;
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('token', response.data.token);

        // Set default authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        return newUser;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      console.error('Registration error:', {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data
      });
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Clear axios default header
    delete axios.defaults.headers.common['Authorization'];
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if token is expired and handle logout
  const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      if (payload.exp < currentTime) {
        // Token is expired, logout user
        logout();
        return false;
      }
      return true;
    } catch (error) {
      // Invalid token format, logout user
      logout();
      return false;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    checkTokenExpiration
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 