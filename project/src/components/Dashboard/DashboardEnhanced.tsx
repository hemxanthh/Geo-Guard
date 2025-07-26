import { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import clsx from 'clsx';
import { 
  Car, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Shield, 
  Satellite, 
  Map,
  Battery,
  TrendingUp,
  Settings,
  History
} from 'lucide-react';

interface DashboardStats {
  totalTrips: number;
  totalDistance: number;
  totalTime: string;
  avgSpeed: number;
  todayTrips: number;
  weeklyDistance: number;
  fuelLevel: number;
  maintenanceAlert: boolean;
}

interface DashboardProps {
  onPageChange?: (page: string) => void;
}

export default function DashboardEnhanced({ onPageChange }: DashboardProps) {
  const { vehicleStatus } = useSocket();
  const currentVehicle = Object.values(vehicleStatus)[0] || null;
  const [currentTime, setCurrentTime] = useState(new Date());

  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    totalDistance: 0,
    totalTime: "0h 0m",
    avgSpeed: 0,
    todayTrips: 0,
    weeklyDistance: 0,
    fuelLevel: 85,
    maintenanceAlert: false
  });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load trip statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('http://localhost:3001/trips');
        const trips = await response.json();
        
        if (trips.length > 0) {
          const totalDistance = trips.reduce((sum: number, trip: any) => sum + trip.distance, 0);
          const totalDuration = trips.reduce((sum: number, trip: any) => sum + trip.duration, 0);
          const avgSpeed = totalDistance > 0 ? (totalDistance / (totalDuration / 3600)) : 0;
          
          // Get today's trips
          const today = new Date().toDateString();
          const todayTrips = trips.filter((trip: any) => 
            new Date(trip.startTime).toDateString() === today
          ).length;

          // Get this week's distance
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const weeklyDistance = trips
            .filter((trip: any) => new Date(trip.startTime) >= weekStart)
            .reduce((sum: number, trip: any) => sum + trip.distance, 0);
          
          const hours = Math.floor(totalDuration / 3600);
          const minutes = Math.floor((totalDuration % 3600) / 60);
          
          setStats({
            totalTrips: trips.length,
            totalDistance,
            totalTime: `${hours}h ${minutes}m`,
            avgSpeed,
            todayTrips,
            weeklyDistance,
            fuelLevel: 85 + Math.random() * 10, // Simulate fuel level
            maintenanceAlert: trips.length > 15 // Maintenance alert after 15 trips
          });
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'map':
        onPageChange?.('live-map');
        break;
      case 'trips':
        onPageChange?.('trip-history');
        break;
      case 'settings':
        onPageChange?.('settings');
        break;
      default:
        console.log(`Quick action: ${action}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with System Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your fleet and security status</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">System Online</span>
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
      </div>

      {/* Quick Stats Cards - Similar to your image */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Vehicles */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Total Vehicles</h3>
                <p className="text-sm text-gray-500">Registered in system</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900">1</div>
          </div>
        </div>

        {/* Active Now */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Active Now</h3>
                <p className="text-sm text-gray-500">Currently moving</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900">
              {currentVehicle?.ignitionOn ? '1' : '0'}
            </div>
          </div>
        </div>

        {/* Total Trips */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Total Trips</h3>
                <p className="text-sm text-gray-500">This month</p>
                <span className="text-xs text-green-600 font-medium">+12%</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900">{stats.totalTrips}</div>
          </div>
        </div>

        {/* Unread Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Unread Alerts</h3>
                <p className="text-sm text-gray-500">Requires attention</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900">
              {stats.maintenanceAlert ? '1' : '0'}
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Status Section - Primary Vehicle */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Vehicle Status</h3>
              <p className="text-sm text-gray-500">Primary Vehicle</p>
            </div>
          </div>
          <div className={clsx(
            "px-3 py-1 rounded-full text-sm font-medium",
            currentVehicle?.ignitionOn 
              ? "bg-green-100 text-green-800" 
              : "bg-gray-100 text-gray-800"
          )}>
            Engine {currentVehicle?.ignitionOn ? 'ON' : 'OFF'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Battery Level */}
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <Battery className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Battery</h4>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {currentVehicle?.batteryLevel || 95}%
            </div>
          </div>

          {/* GPS Signal */}
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <Satellite className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">GPS Signal</h4>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {currentVehicle?.gpsSignal || 96}%
            </div>
          </div>

          {/* Current Location */}
          <div className="col-span-1 md:col-span-2 p-4 bg-yellow-50 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-5 h-5 text-yellow-600" />
              <h4 className="font-medium text-gray-900">Current Location</h4>
            </div>
            <div className="text-sm text-gray-600">
              {currentVehicle ? 
                `${currentVehicle.location?.latitude?.toFixed(6) || '28.614698'}, ${currentVehicle.location?.longitude?.toFixed(6) || '77.212735'}` :
                '28.614698, 77.212735'
              }
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Speed: {Math.round(currentVehicle?.location?.speed || 0)} km/h
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <div className="text-lg font-medium text-gray-600 mb-1">No alerts at this time</div>
            <div className="text-sm text-gray-500">Your vehicles are secure</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* View Live Map */}
        <button
          onClick={() => handleQuickAction('map')}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Map className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Live Map</h3>
            </div>
          </div>
        </button>

        {/* Trip History */}
        <button
          onClick={() => handleQuickAction('trips')}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <History className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Trip History</h3>
            </div>
          </div>
        </button>

        {/* Security Settings */}
        <button
          onClick={() => handleQuickAction('settings')}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
              <Settings className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Security Settings</h3>
            </div>
          </div>
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Statistics Overview</h3>
              <p className="text-sm text-gray-500">Vehicle activity summary</p>
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
