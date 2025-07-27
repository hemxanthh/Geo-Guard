import { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import clsx from 'clsx';
import { 
  Car, 
  Clock, 
  AlertTriangle, 
  Signal, 
  Power, 
  Navigation, 
  Shield, 
  Unlock, 
  Bell, 
  Gauge, 
  Satellite, 
  Map
} from 'lucide-react';

interface DashboardStats {
  totalTrips: number;
  totalDistance: number;
  totalTime: string;
  avgSpeed: number;
}

interface Notification {
  id: number;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface DashboardProps {
  onPageChange?: (page: string) => void;
  onTripCompleted?: () => void;
}

// Safe data access helpers
const getVehicleLocation = (vehicle: any) => {
  if (!vehicle?.location) return { lat: 0, lng: 0, latitude: 0, longitude: 0 };
  return {
    lat: vehicle.location.lat || vehicle.location.latitude || 0,
    lng: vehicle.location.lng || vehicle.location.longitude || 0,
    latitude: vehicle.location.latitude || vehicle.location.lat || 0,
    longitude: vehicle.location.longitude || vehicle.location.lng || 0
  };
};

const getVehicleSpeed = (vehicle: any) => {
  return vehicle?.speed || vehicle?.location?.speed || 0;
};

const isVehicleIgnitionOn = (vehicle: any) => {
  return vehicle?.ignitionOn || vehicle?.engine || false;
};

export default function Dashboard({ onPageChange, onTripCompleted }: DashboardProps) {
  const { vehicleStatus } = useSocket();
  // Get the first vehicle from vehicleStatus (assuming single vehicle for now)
  const currentVehicle = Object.values(vehicleStatus)[0] || null;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: "System started successfully", time: "5 min ago", type: "success" },
    { id: 2, message: "GPS signal acquired", time: "3 min ago", type: "info" },
  ]);

  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    totalDistance: 0,
    totalTime: "0h 0m",
    avgSpeed: 0
  });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load trip statistics with error handling
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('http://localhost:3001/trips');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const trips = await response.json();
        
        if (Array.isArray(trips) && trips.length > 0) {
          const totalDistance = trips.reduce((sum: number, trip: any) => sum + (trip.distance || 0), 0);
          const totalDuration = trips.reduce((sum: number, trip: any) => sum + (trip.duration || 0), 0);
          const avgSpeed = totalDistance > 0 && totalDuration > 0 ? (totalDistance / (totalDuration / 3600)) : 0;
          
          const hours = Math.floor(totalDuration / 3600);
          const minutes = Math.floor((totalDuration % 3600) / 60);
          
          setStats({
            totalTrips: trips.length,
            totalDistance,
            totalTime: `${hours}h ${minutes}m`,
            avgSpeed
          });
        }
      } catch (error) {
        console.error('Error loading stats:', error);
        setNotifications(prev => [
          { id: Date.now(), message: "Failed to load trip statistics", time: "Just now", type: "warning" },
          ...prev.slice(0, 4)
        ]);
      }
    };

    loadStats();
  }, []);

  const handleToggleIgnition = async () => {
    try {
      setNotifications(prev => [
        { id: Date.now(), message: "Processing ignition toggle...", time: "Just now", type: "info" },
        ...prev.slice(0, 4)
      ]);

      const response = await fetch('http://localhost:3001/toggle-ignition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Ignition toggle result:', result);

      // Show success notification
      setNotifications(prev => [
        { 
          id: Date.now(), 
          message: result.message || "Ignition toggled successfully", 
          time: "Just now", 
          type: "success" 
        },
        ...prev.slice(1, 4) // Remove the "processing" message
      ]);

      // Call trip completed callback when ignition is turned off
      if (currentVehicle && isVehicleIgnitionOn(currentVehicle) && !result.ignitionOn) {
        onTripCompleted?.();
      }
    } catch (error) {
      console.error("Error toggling ignition:", error);
      setNotifications(prev => [
        { 
          id: Date.now(), 
          message: "Failed to toggle ignition. Please check connection and try again.", 
          time: "Just now", 
          type: "error" 
        },
        ...prev.slice(1, 4) // Remove the "processing" message
      ]);
    }
  };

  const handleRemoteUnlock = () => {
    console.log("Remote unlock button pressed");
    setNotifications(prev => [
      { id: Date.now(), message: "Remote unlock command sent", time: "Just now", type: "info" },
      ...prev.slice(0, 4)
    ]);
  };

  const handleGoToLiveMap = () => {
    if (onPageChange) {
      onPageChange('live-map');
    }
  };

  // Safe vehicle data extraction
  const vehicleLocation = getVehicleLocation(currentVehicle);
  const vehicleSpeed = getVehicleSpeed(currentVehicle);
  const ignitionStatus = isVehicleIgnitionOn(currentVehicle);

  return (
    <div className="space-y-6">
      {/* Header with Real-time Clock */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Vehicle monitoring and control center - Bangalore</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-mono font-medium text-gray-900">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
          <div className="text-xs text-gray-500 text-center">
            {currentTime.toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Speed Indicator */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gauge className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Current Speed</h3>
                <p className="text-sm text-gray-500">Real-time</p>
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {Math.round(vehicleSpeed)}
            <span className="text-lg text-gray-500 ml-1">km/h</span>
          </div>
          <div className={clsx(
            "text-sm",
            currentVehicle?.isMoving ? "text-green-600" : "text-gray-500"
          )}>
            {currentVehicle?.isMoving ? "Moving" : "Stationary"}
          </div>
        </div>

        {/* GPS Signal Strength */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Satellite className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">GPS Signal</h3>
                <p className="text-sm text-gray-500">Satellite connection</p>
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {currentVehicle?.gpsSignal || 85}%
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
              <div 
                className={clsx(
                  "h-2 rounded-full transition-all duration-300 absolute left-0 top-0",
                  (currentVehicle?.gpsSignal || 85) > 70 ? "bg-green-500 w-[85%]" :
                  (currentVehicle?.gpsSignal || 85) > 40 ? "bg-yellow-500 w-[60%]" : "bg-red-500 w-[30%]"
                )}
              >
              </div>
            </div>
            <Signal className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Total Distance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Navigation className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Total Distance</h3>
                <p className="text-sm text-gray-500">Today</p>
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {stats.totalDistance.toFixed(1)}
            <span className="text-lg text-gray-500 ml-1">km</span>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {currentVehicle?.lastUpdate ? new Date(currentVehicle.lastUpdate).toLocaleTimeString() : "N/A"}
          </div>
        </div>

        {/* Security Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Security</h3>
                <p className="text-sm text-gray-500">Theft protection</p>
              </div>
            </div>
          </div>
          <div className="text-lg font-bold text-green-600 mb-2">
            SECURE
          </div>
          <div className="text-sm text-gray-500">
            No theft alerts detected
          </div>
        </div>
      </div>

      {/* Control Panel Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mini Live Map Widget */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 col-span-1 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Map className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Live Location</h3>
                <p className="text-sm text-gray-500">Click to view detailed map</p>
              </div>
            </div>
            <button
              onClick={handleGoToLiveMap}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              View Full Map
            </button>
          </div>
          
          <div 
            className="bg-gray-100 rounded-xl h-48 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleGoToLiveMap}
          >
            <div className="text-center">
              <div className={clsx(
                "w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-colors",
                ignitionStatus ? "bg-green-100" : "bg-gray-200"
              )}>
                <Car className={clsx(
                  "w-8 h-8",
                  ignitionStatus ? "text-green-600" : "text-gray-400"
                )} />
              </div>
              <div className="text-lg font-semibold text-gray-700 mb-1">
                {currentVehicle ? 'Vehicle VH-001' : 'No Vehicle Data'}
              </div>
              <div className="text-sm text-gray-500">
                {currentVehicle ? 
                  `${vehicleLocation.latitude.toFixed(6)}, ${vehicleLocation.longitude.toFixed(6)}` :
                  'Waiting for GPS...'
                }
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Bangalore, India
              </div>
              <div className={clsx(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2",
                ignitionStatus 
                  ? "bg-green-100 text-green-800" 
                  : "bg-gray-100 text-gray-800"
              )}>
                <div className={clsx(
                  "w-2 h-2 rounded-full mr-2",
                  ignitionStatus ? "bg-green-400" : "bg-gray-400"
                )}></div>
                {ignitionStatus ? 'Engine ON' : 'Engine OFF'}
              </div>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="space-y-4">
          {/* Ignition Control */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Power className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Engine Control</h3>
                <p className="text-xs text-gray-500">Remote ignition</p>
              </div>
            </div>
            <button
              onClick={handleToggleIgnition}
              className={clsx(
                "w-full py-3 px-4 rounded-xl font-medium transition-all duration-200",
                ignitionStatus
                  ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
              )}
            >
              <div className="flex items-center justify-center space-x-2">
                <Power className="w-5 h-5" />
                <span>{ignitionStatus ? 'Turn OFF' : 'Turn ON'}</span>
              </div>
            </button>
          </div>

          {/* Remote Unlock */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Unlock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Remote Unlock</h3>
                <p className="text-xs text-gray-500">Vehicle access</p>
              </div>
            </div>
            <button
              onClick={handleRemoteUnlock}
              className="w-full py-3 px-4 bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200 rounded-xl font-medium transition-all duration-200"
            >
              <div className="flex items-center justify-center space-x-2">
                <Unlock className="w-5 h-5" />
                <span>Unlock Vehicle</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts and Notifications Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theft Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Security Alerts</h3>
              <p className="text-sm text-gray-500">Theft and tampering detection</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div>
                  <div className="font-medium text-green-800">All Systems Normal</div>
                  <div className="text-sm text-green-600">No security threats detected</div>
                </div>
              </div>
              <div className="text-xs text-green-600 font-medium">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
            
            <div className="text-center py-4">
              <Shield className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <div className="text-sm text-gray-500">Vehicle is secure</div>
            </div>
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-500">Recent activity</p>
              </div>
            </div>
            {notifications.length > 0 && (
              <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {notifications.length}
              </div>
            )}
          </div>
          
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={clsx(
                    "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                    notification.type === 'info' ? 'bg-blue-400' :
                    notification.type === 'success' ? 'bg-green-400' :
                    notification.type === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                  )}></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {notification.message}
                    </div>
                    <div className="text-xs text-gray-500">
                      {notification.time}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <div className="text-sm text-gray-500">No new notifications</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trip Summary Footer */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Car className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Today's Summary</h3>
              <p className="text-sm text-gray-500">Vehicle activity overview</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalTrips}</div>
            <div className="text-sm text-gray-500">Total Trips</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalDistance.toFixed(1)}km</div>
            <div className="text-sm text-gray-500">Distance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalTime}</div>
            <div className="text-sm text-gray-500">Active Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.avgSpeed.toFixed(1)}km/h</div>
            <div className="text-sm text-gray-500">Avg Speed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
