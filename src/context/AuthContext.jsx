import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMyInfo, checkTokenValid } from '../api/auth';

const AuthContext = createContext(null);
const USER_EMAIL_STORAGE_KEY = 'user_email';

/**
 * 인증 상태를 전역으로 관리하는 Context Provider.
 * 앱 마운트 시 localStorage 토큰으로 자동 로그인 복구를 시도한다.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * 저장된 토큰으로 유저 정보를 복구한다. 토큰이 없거나 만료되면 로그아웃 처리.
   *
   * @returns {Promise<void>}
   */
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

  /**
   * 토큰과 유저 정보를 저장하고 로그인 상태로 전환한다.
   *
   * @param {string} token - 인증 토큰
   * @param {Object} userData - 유저 정보
   */
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

  /**
   * localStorage를 초기화하고 로그아웃 상태로 전환한다.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accountname');
    localStorage.removeItem(USER_EMAIL_STORAGE_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * 유저 정보를 업데이트하고 localStorage에 반영한다.
   *
   * @param {Object} userData - 수정된 유저 정보
   */
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

/**
 * AuthContext를 소비하는 커스텀 훅. AuthProvider 외부에서 사용 시 에러를 던진다.
 *
 * @returns {{ user: Object, isLoading: boolean, isAuthenticated: boolean, login: Function, logout: Function, updateUser: Function, initAuth: Function }}
 * @throws {Error} AuthProvider 외부에서 호출 시
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
