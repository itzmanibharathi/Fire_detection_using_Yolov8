import { useState, useEffect, useCallback } from 'react';

export const useAlertLoop = () => {
  const [alerts, setAlerts] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate Sensor mock data keeping EXACT requested structure
  const generateSensorAlert = useCallback(() => {
    return {
      // COMMON FIELDS
      id: `sensor-${Date.now()}`,
      type: "SENSOR_ALERT",
      locationName: "Sathyamangalam Forest",
      latitude: 11.5034,
      longitude: 77.2625,
      timestamp: new Date().toISOString(),
      accessCode: "AUTH-992",
      summary: "High Temperature Detected – Possible Fire Risk",
      // SENSOR ALERT FIELDS
      temperature: Math.floor(Math.random() * (85 - 65 + 1) + 65), // 65-85
      humidity: Math.floor(Math.random() * (25 - 10 + 1) + 10), // 10-25
      smokeLevel: Math.random() < 0.5 ? "Low" : "Medium",
      riskLevel: "High",
      status: "Active"
    };
  }, []);

  // Generate Drone mock data keeping EXACT requested structure
  const generateDroneAlert = useCallback(() => {
    return {
      // COMMON FIELDS
      id: `drone-${Date.now()}`,
      type: "DRONE_ALERT",
      locationName: "Sathyamangalam Forest",
      latitude: 11.5041,
      longitude: 77.2618,
      timestamp: new Date().toISOString(),
      accessCode: "AUTH-810",
      summary: "🚁 Drone Detected Possible Fire",
      // DRONE ALERT FIELDS
      detectionType: "Fire/Smoke",
      confidence: Math.floor(Math.random() * (99 - 85 + 1) + 85), // 85-99
      imageUrl: "/src/assets/mock-fire.png", // Will be rendered via URL or imported locally
      droneId: "DRN-X9",
      altitude: Math.floor(Math.random() * (120 - 80 + 1) + 80), // 80-120m
      speed: Math.floor(Math.random() * (45 - 20 + 1) + 20), // 20-45 km/h
      severity: "Critical"
    };
  }, []);

  useEffect(() => {
    let currentType = 'SENSOR';
    let timeoutId;

    const tick = () => {
      const newAlert =
        currentType === 'SENSOR'
          ? generateSensorAlert()
          : generateDroneAlert();

      // Only push new alert if we don't have an active modal (optional UX choice)
      // We push it to queue and if no active alert, set it active
      setAlerts((prev) => {
        const nextQueue = [...prev, newAlert];
        return nextQueue;
      });

      // Swap type for next 15s tick
      currentType = currentType === 'SENSOR' ? 'DRONE' : 'SENSOR';
      timeoutId = setTimeout(tick, 15000);
    };

    // Start loop
    timeoutId = setTimeout(tick, 15000);

    return () => clearTimeout(timeoutId);
  }, [generateSensorAlert, generateDroneAlert]);

  // Handle auto-displaying alerts from queue
  useEffect(() => {
    if (alerts.length > 0 && !activeAlert && !isModalOpen) {
      setActiveAlert(alerts[0]);
      setAlerts((prev) => prev.slice(1));
    }
  }, [alerts, activeAlert, isModalOpen]);

  // Actions
  const dismissAlert = () => {
    setActiveAlert(null);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveAlert(null);
  };

  const handleDroneAction = async (actionType) => {
    // Optional simulate API call here using utils/api
    return new Promise((resolve) => setTimeout(resolve, 800)).then(() => {
      closeModal();
    });
  };

  return {
    activeAlert,
    isModalOpen,
    dismissAlert,
    openModal,
    closeModal,
    handleDroneAction,
  };
};

export default useAlertLoop;
