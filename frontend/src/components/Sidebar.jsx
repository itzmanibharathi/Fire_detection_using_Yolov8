import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { 
  FiHome, 
  FiClock, 
  FiMap, 
  FiCpu, 
  FiSettings, 
  FiLogOut,
  FiShield,
  FiMoon,
  FiSun
} from "react-icons/fi";

const Sidebar = () => {
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const navItems = [
    { name: "Overview", path: "/", icon: <FiHome className="w-5 h-5" /> },
    { name: "Detection History", path: "/history", icon: <FiClock className="w-5 h-5" /> },
    { name: "Live Map", path: "/map", icon: <FiMap className="w-5 h-5" /> },
    { name: "AI Insights", path: "/insights", icon: <FiCpu className="w-5 h-5" /> },
    { name: "Settings", path: "/settings", icon: <FiSettings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col w-64 bg-surface border-r border-border-subtle min-h-screen text-text-muted">
      <div className="flex items-center justify-between px-4 h-20 border-b border-border-subtle">
        <div className="flex items-center">
          <FiShield className="w-8 h-8 text-accent mr-3" />
          <h1 className="text-xl font-bold text-text-main tracking-widest uppercase">FireWatch ID</h1>
        </div>
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-surface-hover text-text-muted transition-colors">
          {isDarkMode ? <FiSun className="w-5 h-5 text-yellow-400" /> : <FiMoon className="w-5 h-5 text-blue-500" />}
        </button>
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto mt-6">
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/30" 
                    : "hover:bg-surface-hover00 hover:text-text-main"
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border-subtle">
        <button
          onClick={logout}
          className="flex items-center px-4 py-3 w-full rounded-xl text-text-muted hover:bg-surface-hover00 hover:text-red-400 transition-colors"
        >
          <FiLogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
