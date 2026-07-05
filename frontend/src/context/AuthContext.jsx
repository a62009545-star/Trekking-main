import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if already logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get('/admin/verify');
        setAdmin(res.data.admin);
      } catch {
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (username, password) => {
    const res = await API.post('/admin/login', { username, password });
    setAdmin(res.data.admin);
    return res.data;
  };

  const logout = async () => {
    await API.post('/admin/logout');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);