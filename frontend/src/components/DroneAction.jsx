import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaCheck } from 'react-icons/fa';

const DroneAction = ({ onAction, alertId }) => {
  const [status, setStatus] = useState("idle"); // idle, processing, success, closed

  const handleAction = async (type) => {
    setStatus("processing");
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (type === "activate") {
      setStatus("success");
      setTimeout(() => {
        onAction(type);
      }, 1500); // Wait to show success, then run callback which closes modal
    } else {
      onAction(type); // Close immediately on decline
    }
  };

  return (
    <div className="mt-6 flex flex-col items-center">
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div 
            key="actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex w-full gap-4"
          >
            <button
              onClick={() => handleAction("activate")}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
            >
              <FaCheckCircle />
              <span>Activate Drone</span>
            </button>
            <button
              onClick={() => handleAction("decline")}
              className="flex-1 flex items-center justify-center gap-2 bg-surface/50 border border-border-subtle hover:bg-surface text-text-main font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <FaTimesCircle />
              <span>Decline</span>
            </button>
          </motion.div>
        )}

        {status === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-3 text-text-muted gap-2"
          >
            <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            <span>Processing request...</span>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-medium py-3 px-4 rounded-lg"
          >
            <FaCheck />
            <span>✅ Drone successfully dispatched</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DroneAction;
