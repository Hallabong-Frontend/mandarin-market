import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMyInfo, checkTokenValid } from '../api/auth';

const AuthContext = createContext(null);
const USER_EMAIL_STORAGE_KEY = 'user_email';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await getMyInfo();
      const fetchedUser = data.user ?? data;
      const savedEmail = localStorage.getItem(USER_EMAIL_STORAGE_KEY);
      setUser({
        ...fetchedUser,
        email: fetchedUser?.email || savedEmail || '',
      });
      setIsAuthenticated(true);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('accountname');
      localStorage.removeItem(USER_EMAIL_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = (token, userData) => {
    const normalizedUser = {
      ...userData,
      email: userData?.email || localStorage.getItem(USER_EMAIL_STORAGE_KEY) || '',
    };

    localStorage.setItem('token', token);
    localStorage.setItem('accountname', normalizedUser.accountname);
    if (normalizedUser.email) {
      localStorage.setItem(USER_EMAIL_STORAGE_KEY, normalizedUser.email);
    }

    setUser(normalizedUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accountname');
    localStorage.removeItem(USER_EMAIL_STORAGE_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('accountname', userData.accountname);
    if (userData?.email) {
      localStorage.setItem(USER_EMAIL_STORAGE_KEY, userData.email);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, login, logout, updateUser, initAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
