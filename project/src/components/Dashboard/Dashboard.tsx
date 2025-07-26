import React, { useState, useEffect } from 'react';
import { Car, MapPin, Clock, AlertTriangle, Battery, Signal, Power } from 'lucide-react';
import DashboardCard from './DashboardCard';
import { useSocket } from '../../contexts/SocketContext';
import { DashboardStats } from '../../types';
import { clsx } from 'clsx';

// The component now accepts a prop to call when a trip is completed
const Dashboard: React.FC<{ onTripCompleted?: () => void }> = ({ onTripCompleted }) => {
  const { vehicleStatus, alerts, connected } = useSocket();
  const [stats, setStats] = useState<DashboardStats>({ /* ... */ });
  const currentVehicle = Object.values(vehicleStatus)[0];

  useEffect(() => { /* ... existing useEffect logic ... */ }, [vehicleStatus, alerts]);

  const handleToggleIgnition = async () => {
    try {
      const response = await fetch('http://localhost:3001/toggle-ignition', {
        method: 'POST',
      });
      const result = await response.json();
      console.log(result.message);

      // --- NEW: If ignition was just turned OFF, refresh the trip list ---
      if (currentVehicle && !currentVehicle.ignitionOn === false) {
        onTripCompleted?.();
      }
      // ---------------------------------------------------------------

    } catch (error) {
      console.error("Error toggling ignition:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* ... The rest of the JSX for the dashboard remains the same ... */}
       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button onClick={handleToggleIgnition} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Power className={clsx("w-5 h-5", currentVehicle?.ignitionOn ? "text-green-600" : "text-red-600")} />
            <span className="font-medium text-gray-900">
              {currentVehicle?.ignitionOn ? "Turn Ignition OFF (End Trip)" : "Turn Ignition ON (Start Trip)"}
            </span>
          </button>
          {/* ... other buttons ... */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;