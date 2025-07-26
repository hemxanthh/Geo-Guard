import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import { MapPin, Navigation, Battery, Signal, Clock, Crosshair } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { VehicleStatus, Location } from '../../types';
import { clsx } from 'clsx';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

// Create custom vehicle icon
const createVehicleIcon = (isMoving: boolean, heading: number = 0) => {
  const color = isMoving ? '#10b981' : '#6b7280';
  const svgIcon = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2"/>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" x="7" y="7" transform="rotate(${heading} 12 12)">
        <path d="M12 2L22 20H2L12 2Z" fill="white"/>
      </svg>
    </svg>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

interface LiveMapProps {
  vehicleId?: string;
}

// Dummy vehicle simulation
const DUMMY_ROUTE: Location[] = Array.from({ length: 16 }, (_, i) => ({
  latitude: 28.6139 + (i * 0.0003),
  longitude: 77.2090 + (i * 0.0003),
  speed: 10, // slow speed, ~10km/h
  heading: 45,
}));

const DUMMY_BASE: Omit<VehicleStatus, 'location'> = {
  id: 'dummy-vehicle',
  isMoving: true,
  batteryLevel: 65,
  ignitionOn: true,
  lastUpdate: new Date().toISOString(),
};

const LiveMap: React.FC<LiveMapProps> = ({ vehicleId }) => {
  const { vehicleStatus, connected } = useSocket?.() || { vehicleStatus: {}, connected: false };
  const [routeHistory, setRouteHistory] = useState<Location[]>([]);
  const [center, setCenter] = useState<LatLngTuple>([28.6139, 77.2090]);
  const [isFollowing, setIsFollowing] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [dummyVehicle, setDummyVehicle] = useState<VehicleStatus | null>(null);
  const [simulating, setSimulating] = useState(false);
  const mapRef = useRef<any>(null);

  // Use first real vehicle, otherwise dummy
  const currentVehicle = Object.values(vehicleStatus)[0] || dummyVehicle;

  // Simulate dummy movement if no real vehicle
  useEffect(() => {
    if (Object.keys(vehicleStatus).length === 0 && !simulating) {
      setSimulating(true);
      let index = 0;
      setDummyVehicle({
        ...DUMMY_BASE,
        location: DUMMY_ROUTE[0],
        lastUpdate: new Date().toISOString(),
      });
      setRouteHistory([DUMMY_ROUTE[0]]);
      setCenter([DUMMY_ROUTE[0].latitude, DUMMY_ROUTE[0].longitude]);
      const interval = setInterval(() => {
        index++;
        if (index >= DUMMY_ROUTE.length) {
          clearInterval(interval);
          setSimulating(false);
          setDummyVehicle((prev) =>
            prev
              ? { ...prev, isMoving: false, location: DUMMY_ROUTE[DUMMY_ROUTE.length - 1], lastUpdate: new Date().toISOString() }
              : null
          );
          return;
        }
        setDummyVehicle((prev) =>
          prev
            ? {
                ...prev,
                isMoving: true,
                location: DUMMY_ROUTE[index],
                lastUpdate: new Date().toISOString(),
              }
            : null
        );
        setRouteHistory((prev) => [...prev, DUMMY_ROUTE[index]]);
        setCenter([DUMMY_ROUTE[index].latitude, DUMMY_ROUTE[index].longitude]);
      }, 200);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line
  }, [vehicleStatus, simulating]);

  // Real vehicle route history and center
  useEffect(() => {
    if (currentVehicle && isFollowing) {
      const newCenter: LatLngTuple = [
        currentVehicle.location.latitude,
        currentVehicle.location.longitude
      ];
      setCenter(newCenter);
      setRouteHistory(prev => [
        ...prev.slice(-50),
        currentVehicle.location
      ]);
    }
  }, [currentVehicle, isFollowing]);

  const handleCenterOnVehicle = () => {
    if (currentVehicle && mapRef.current) {
      const newCenter: LatLngTuple = [
        currentVehicle.location.latitude,
        currentVehicle.location.longitude
      ];
      mapRef.current.setView(newCenter, 16);
      setIsFollowing(true);
    }
  };

  const routeCoordinates: LatLngTuple[] = routeHistory.map(loc => [loc.latitude, loc.longitude]);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Tracking</h1>
            <p className="text-gray-600 mt-1">Real-time vehicle location monitoring</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <div className={clsx(
              'flex items-center space-x-2 px-3 py-2 rounded-lg',
              connected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            )}>
              <div className={clsx(
                'w-2 h-2 rounded-full',
                connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              )}></div>
              <span className="text-sm font-medium">
                {connected ? 'Live Updates' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        {currentVehicle && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className={clsx(
                  'font-medium',
                  currentVehicle.isMoving ? 'text-green-600' : 'text-gray-900'
                )}>
                  {currentVehicle.isMoving ? 'Moving' : 'Stationary'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Navigation className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-sm text-gray-600">Speed</div>
                <div className="font-medium text-gray-900">
                  {Math.round(currentVehicle.location.speed || 0)} km/h
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Battery className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-600">Battery</div>
                <div className="font-medium text-gray-900">{currentVehicle.batteryLevel}%</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-sm text-gray-600">Last Update</div>
                <div className="font-medium text-gray-900">
                  {new Date(currentVehicle.lastUpdate).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Controls */}
        <div className="flex items-center space-x-3 mt-4">
          <button
            onClick={handleCenterOnVehicle}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Crosshair className="w-4 h-4" />
            <span>Center on Vehicle</span>
          </button>
          
          <button
            onClick={() => setShowRoute(!showRoute)}
            className={clsx(
              'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
              showRoute 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            <span>Route Trail</span>
          </button>
          
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={clsx(
              'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
              isFollowing 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            <span>Auto Follow</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {!currentVehicle ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Waiting for vehicle data...</h3>
              <p className="text-gray-500">Live tracking will appear when data is received</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Vehicle Marker */}
            <Marker
              position={[currentVehicle.location.latitude, currentVehicle.location.longitude]}
              icon={createVehicleIcon(currentVehicle.isMoving, currentVehicle.location.heading)}
            >
              <Popup>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Vehicle Status</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Speed:</span>
                      <span className="ml-1 font-medium">{Math.round(currentVehicle.location.speed || 0)} km/h</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Battery:</span>
                      <span className="ml-1 font-medium">{currentVehicle.batteryLevel}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Ignition:</span>
                      <span className={clsx(
                        'ml-1 font-medium',
                        currentVehicle.ignitionOn ? 'text-green-600' : 'text-gray-600'
                      )}>
                        {currentVehicle.ignitionOn ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={clsx(
                        'ml-1 font-medium',
                        currentVehicle.isMoving ? 'text-green-600' : 'text-gray-600'
                      )}>
                        {currentVehicle.isMoving ? 'Moving' : 'Stopped'}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      Last update: {new Date(currentVehicle.lastUpdate).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Coordinates: {currentVehicle.location.latitude.toFixed(6)}, {currentVehicle.location.longitude.toFixed(6)}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Route Trail */}
            {showRoute && routeCoordinates.length > 1 && (
              <Polyline
                positions={routeCoordinates}
                color="#3b82f6"
                weight={3}
                opacity={0.8}
                smoothFactor={1}
              />
            )}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default LiveMap;