import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { storage } from '../utils/localStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = storage.getToken();
    const savedUser = storage.getUser();
    if (token && savedUser) {
      setUser(savedUser);
      authAPI.me().then(res => {
        setUser(res.data);
        storage.setUser(res.data);
      }).catch(() => {
        storage.clearAuth();
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data;
    storage.setToken(token);
    storage.setUser(userData);
    setUser(userData);
    return userData;
  };

  const signup = async (data) => {
    const res = await authAPI.signup(data);
    const { token, user: userData } = res.data;
    storage.setToken(token);
    storage.setUser(userData);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    storage.clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
