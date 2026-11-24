import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('groupfare_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default demo user: Rahul Sharma
    return {
      id: 'user_rahul',
      email: 'rahul@groupfare.com',
      full_name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      verification_status: 'Verified Passenger',
      role: 'user'
    };
  });

  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('groupfare_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('groupfare_user');
    }
  }, [currentUser]);

  // Load available demo users for fast switching
  useEffect(() => {
    api.auth.getAllUsers()
      .then(users => setAvailableUsers(users))
      .catch(err => console.error('Failed to load demo users list', err));
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const user = await api.auth.login({ email, password });
      setCurrentUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const user = await api.auth.register(userData);
      setCurrentUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUser = (user) => {
    setCurrentUser(user);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!currentUser,
        isAdmin: currentUser?.role === 'admin',
        loading,
        availableUsers,
        login,
        register,
        logout,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
