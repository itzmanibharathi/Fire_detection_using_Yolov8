import { useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import useAlertLoop from "../hooks/useAlertLoop";
import AlertPopup from "./AlertPopup";
import AlertModal from "./AlertModal";

const Layout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const { 
    activeAlert, 
    isModalOpen, 
    dismissAlert, 
    openModal, 
    closeModal, 
    handleDroneAction 
  } = useAlertLoop();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-border-subtle bg-background/80 backdrop-blur-md z-10 w-full">
          <div className="flex items-center">
            <button 
              className="mr-3 p-2 rounded-md hover:bg-surface-hover md:hidden text-text-muted"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-text-main hidden sm:block">
              {location.pathname === '/' ? 'Dashboard' : 
               location.pathname.replace('/', '').charAt(0).toUpperCase() + location.pathname.substring(2)}
            </h2>
          </div>
          <div className="flex items-center max-w-[50%]">
            <span className="text-sm text-text-muted border border-border-subtle px-3 py-1 rounded-full bg-surface/50 truncate">
              {user.email}
            </span>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 sm:px-8 py-6 z-10">
          <Outlet />
        </main>
      </div>

      {/* Global Alert System Mounting Point */}
      <AlertPopup 
        alert={activeAlert && !isModalOpen ? activeAlert : null} 
        onClick={openModal} 
        onDismiss={dismissAlert} 
      />
      
      <AlertModal 
        isOpen={isModalOpen} 
        alert={activeAlert} 
        onClose={closeModal} 
        onDroneAction={handleDroneAction} 
      />
    </div>
  );
};

export default Layout;
