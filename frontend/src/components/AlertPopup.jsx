import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaHelicopter, FaTimes } from 'react-icons/fa';

const AlertPopup = ({ alert, onClick, onDismiss }) => {
  if (!alert) return null;

  const isSensor = alert.type === "SENSOR_ALERT";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={onClick}
        className="fixed top-20 right-6 z-50 cursor-pointer group"
      >
        <div className={`relative overflow-hidden rounded-xl border backdrop-blur-md shadow-2xl p-4 w-80 md:w-96
          ${isSensor 
            ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60' 
            : 'bg-red-500/10 border-red-500/30 hover:border-red-500/60'}`}
        >
          {/* Background Glow */}
          <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-40 -z-10
            ${isSensor ? 'bg-amber-400' : 'bg-red-500'}`}></div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full 
                ${isSensor ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-500'}`}>
                {isSensor ? <FaExclamationTriangle size={24} /> : <FaHelicopter size={24} />}
              </div>
              <div>
                <h3 className={`font-semibold text-lg
                  ${isSensor ? 'text-amber-500' : 'text-red-500'}`}>
                  {isSensor ? 'Sensor Alert' : 'Drone Alert'}
                </h3>
                <p className="text-sm text-text-main mt-1 font-medium">
                  {alert.summary}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                  <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  <span>•</span>
                  <span>{alert.locationName}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="text-text-muted hover:text-text-main transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AlertPopup;
