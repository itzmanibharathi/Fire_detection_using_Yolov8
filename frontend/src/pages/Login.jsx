import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden text-text-main py-12 px-4 sm:px-6 lg:px-8">
      {/* Background gradients */}
      <div className="absolute w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] -top-32 -left-32 pointer-events-none"></div>
      <div className="absolute w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] bottom-0 right-0 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-surface/60 backdrop-blur-xl border border-border-subtle p-10 rounded-3xl shadow-2xl w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-2xl font-bold text-white">FW</span>
            </div>
          </motion.div>
          <h1 className="text-4xl font-extrabold text-text-main mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-text-muted">Sign in to your FireWatch dashboard</p>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm text-center"
          >
            {error}
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiMail className="text-text-muted transition-colors group-focus-within:text-primary" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background/50 border border-border-subtle text-text-main placeholder-gray-500 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
              placeholder="Email address"
              required
            />
          </div>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiLock className="text-text-muted transition-colors group-focus-within:text-primary" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background/50 border border-border-subtle text-text-main placeholder-gray-500 rounded-xl py-3 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
              placeholder="Password"
              required
            />
            <div 
              className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff className="text-text-muted hover:text-primary transition-colors" /> : <FiEye className="text-text-muted hover:text-primary transition-colors" />}
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-primary/20 flex justify-center items-center"
          >
            Sign In
          </motion.button>
        </form>
        
        <p className="mt-8 text-center text-text-muted text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:text-blue-400 font-semibold transition-colors">
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
