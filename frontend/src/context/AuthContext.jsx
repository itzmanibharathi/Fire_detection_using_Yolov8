import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import api from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to set auth header across axios and api instance
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
      delete api.defaults.headers.common["Authorization"];
    }
  };

  // Initialize auth
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setAuthHeader(token);
    }
    setLoading(false);

    // Global interceptor for 401 ghost sessions
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn("Unauthorized access detected (401). Automatically logging out to wipe ghost session.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setAuthHeader(null);
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { token, ...userData } = res.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      setAuthHeader(token);
      setUser(userData);
      return true;
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || "Login failed";
      throw msg;
    }
  };

    const register = async (email, password, fullName, phone, organization) => {
    try {
      const payload = { 
        email: email.trim(), 
        password: password, 
        fullName: fullName.trim(), 
        phone: phone.trim(), 
        organization: organization.trim() 
      };
      
      console.log("DEBUG: Frontend Sending Registration Payload:", payload);
      
      const res = await api.post("/api/auth/register", payload);
      const { token, ...userData } = res.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      setAuthHeader(token);
      setUser(userData);
      return true;
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || "Registration failed";
      throw msg;
    }
  };

  const updateProfile = async (fullName, phone, organization) => {
    try {
      const res = await api.put("/api/auth/profile", { fullName, phone, organization });
      const newUserData = res.data;
      localStorage.setItem("user", JSON.stringify(newUserData));
      setUser(newUserData);
      return true;
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || "Profile update failed";
      throw msg;
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await api.put("/api/auth/password", { currentPassword, newPassword });
      return true;
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || "Password update failed";
      throw msg;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthHeader(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, updatePassword, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
