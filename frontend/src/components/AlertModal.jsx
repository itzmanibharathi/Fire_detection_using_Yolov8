import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMapMarkerAlt, FaTemperatureHigh, FaTint, FaInfoCircle, FaFire } from 'react-icons/fa';
import DroneAction from './DroneAction';

const AlertModal = ({ isOpen, alert, onClose, onDroneAction }) => {
  if (!alert) return null;

  const isSensor = alert.type === "SENSOR_ALERT";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-0"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header Gradient */}
              <div className={`h-2 w-full ${isSensor ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}></div>
              
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className={`text-2xl font-bold flex items-center gap-2 ${isSensor ? 'text-amber-500' : 'text-red-500'}`}>
                      {isSensor ? <FaTemperatureHigh /> : <FaFire />}
                      {isSensor ? 'Sensor Warning' : 'Drone Detection'}
                    </h2>
                    <p className="text-text-muted text-sm mt-1">{alert.summary}</p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-2 bg-surface hover:bg-surface-elevated text-text-muted hover:text-text-main rounded-full transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  {/* Common Location & Time */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-background/50 p-4 rounded-xl border border-border-subtle">
                    <div className="flex items-center gap-2 text-sm text-text-main">
                      <FaMapMarkerAlt className="text-primary" />
                      <span>{alert.locationName}</span>
                    </div>
                    <div className="hidden sm:block text-border-subtle">|</div>
                    <div className="text-sm text-text-muted">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>

                  {/* Specific Data Details */}
                  {isSensor ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/50 p-4 rounded-xl border border-border-subtle flex flex-col items-center justify-center gap-2">
                        <FaTemperatureHigh className="text-amber-500 text-2xl" />
                        <span className="text-sm text-text-muted">Temperature</span>
                        <span className="text-xl font-bold text-text-main">{alert.temperature}°C</span>
                      </div>
                      <div className="bg-background/50 p-4 rounded-xl border border-border-subtle flex flex-col items-center justify-center gap-2">
                        <FaTint className="text-blue-500 text-2xl" />
                        <span className="text-sm text-text-muted">Humidity</span>
                        <span className="text-xl font-bold text-text-main">{alert.humidity}%</span>
                      </div>
                      <div className="bg-background/50 p-4 rounded-xl border border-border-subtle flex flex-col items-center justify-center gap-2 col-span-2 sm:col-span-1">
                        <FaInfoCircle className="text-purple-500 text-2xl" />
                        <span className="text-sm text-text-muted">Risk Level</span>
                        <span className="text-lg font-bold text-purple-400">{alert.riskLevel}</span>
                      </div>
                      <div className="bg-background/50 p-4 rounded-xl border border-border-subtle flex flex-col items-center justify-center gap-2 col-span-2 sm:col-span-1">
                        <FaFire className="text-orange-500 text-2xl" />
                        <span className="text-sm text-text-muted">Smoke Level</span>
                        <span className="text-lg font-bold text-orange-400">{alert.smokeLevel}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Image Preview */}
                      <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border-subtle bg-black">
                        <img 
                          src={alert.imageUrl} 
                          alt="Detected Fire" 
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-red-500/50">
                          <span className="text-xs font-bold text-red-500">{alert.confidence}% Confidence</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background/50 p-4 rounded-xl border border-border-subtle">
                          <span className="text-xs text-text-muted block mb-1">Detection Type</span>
                          <span className="text-sm font-semibold text-text-main">{alert.detectionType}</span>
                        </div>
                        <div className="bg-background/50 p-4 rounded-xl border border-border-subtle">
                          <span className="text-xs text-text-muted block mb-1">Drone ID</span>
                          <span className="text-sm font-semibold text-text-main">{alert.droneId}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <DroneAction onAction={onDroneAction} alertId={alert.id} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AlertModal;
