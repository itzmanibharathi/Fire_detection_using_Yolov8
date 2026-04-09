import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Set default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setLoading(false);

    // Global interceptor for 401 ghost sessions
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn("Unauthorized access detected (401). Automatically logging out to wipe ghost session.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          delete axios.defaults.headers.common["Authorization"];
          setUser(null);
          // Auto redirect handled by protected routes
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      const { token, ...userData } = res.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);
      return true;
    } catch (error) {
      throw error.response?.data?.error || "Login failed";
    }
  };

  const register = async (email, password, fullName, phone, organization) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", { 
        email, 
        password, 
        fullName, 
        phone, 
        organization 
      });
      const { token, ...userData } = res.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);
      return true;
    } catch (error) {
      throw error.response?.data?.error || "Registration failed";
    }
  };

  const updateProfile = async (fullName, phone, organization) => {
    try {
      const res = await axios.put("http://localhost:5000/api/auth/profile", { fullName, phone, organization });
      const newUserData = res.data;
      localStorage.setItem("user", JSON.stringify(newUserData));
      setUser(newUserData);
      return true;
    } catch (error) {
      throw error.response?.data?.error || "Profile update failed";
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put("http://localhost:5000/api/auth/password", { currentPassword, newPassword });
      return true;
    } catch (error) {
      throw error.response?.data?.error || "Password update failed";
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, updatePassword, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
