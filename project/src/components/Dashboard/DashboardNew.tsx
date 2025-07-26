import { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { Car, MapPin, Clock, Power, Navigation, Shield, Bell, Gauge } from 'lucide-react';

export default function Dashboard({ onPageChange, onTripCompleted }: any) {
  const { vehicleStatus } = useSocket();
  const currentVehicle = Object.values(vehicleStatus)[0] || null;
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleIgnition = async () => {
    try {
      await fetch('http://localhost:3001/toggle-ignition', { method: 'POST' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="bg-white rounded-xl shadow-sm border px-4 py-2">
          <Clock className="w-5 h-5 text-blue-600 inline mr-2" />
          {currentTime.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Gauge className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="font-semibold">Speed</h3>
              <p className="text-sm text-gray-500">Current</p>
            </div>
          </div>
          <div className="text-3xl font-bold">
            {Math.round(currentVehicle?.location?.speed || 0)}
            <span className="text-lg text-gray-500 ml-1">km/h</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Navigation className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-semibold">Distance</h3>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
          <div className="text-3xl font-bold">15.2<span className="text-lg text-gray-500 ml-1">km</span></div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold">Security</h3>
              <p className="text-sm text-gray-500">Status</p>
            </div>
          </div>
          <div className="text-lg font-bold text-green-600">SECURE</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Power className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="font-semibold">Engine</h3>
              <p className="text-sm text-gray-500">Control</p>
            </div>
          </div>
          <button onClick={handleToggleIgnition} className="w-full py-2 px-4 rounded-lg bg-green-100 text-green-700 hover:bg-green-200">
            {currentVehicle?.ignitionOn ? 'Turn OFF' : 'Turn ON'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold">Live Location</h3>
              <p className="text-sm text-gray-500">Click to view map</p>
            </div>
          </div>
          <button onClick={() => onPageChange?.('live-map')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            View Map
          </button>
        </div>
        
        <div className="bg-gray-100 rounded-xl h-32 flex items-center justify-center cursor-pointer" onClick={() => onPageChange?.('live-map')}>
          <div className="text-center">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-700">
              {currentVehicle ? 'Vehicle VH-001' : 'No Vehicle Data'}
            </div>
            <div className="text-xs text-gray-500">
              {currentVehicle ? 
                `${currentVehicle.location?.latitude?.toFixed(4) || 'N/A'}, ${currentVehicle.location?.longitude?.toFixed(4) || 'N/A'}` :
                'Waiting for GPS...'
              }
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Bell className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-sm text-gray-500">Recent activity</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 rounded-full mt-2 bg-green-400"></div>
            <div>
              <div className="text-sm font-medium">System started successfully</div>
              <div className="text-xs text-gray-500">5 min ago</div>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 rounded-full mt-2 bg-blue-400"></div>
            <div>
              <div className="text-sm font-medium">GPS signal acquired</div>
              <div className="text-xs text-gray-500">3 min ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
