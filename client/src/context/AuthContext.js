import { createContext, useState, useEffect, useContext } from 'react';
import { apiRequest, updatePreferences as updatePreferencesApi } from '../services/api';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (name, email, password) => {
    const data = await apiRequest('/auth/register', 'POST', { name, email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', 'POST', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const savePreferences = async (preferredDomains) => {
    const token = localStorage.getItem('token');
    const data = await updatePreferencesApi(preferredDomains, token);

    const updatedUser = { ...user, preferredDomains: data.preferredDomains };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    return data;
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, loading, savePreferences }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);