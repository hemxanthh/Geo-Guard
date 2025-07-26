import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import { MapPin, Navigation, Battery, Clock, Crosshair } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { VehicleStatus, Location } from '../../types';
import { clsx } from 'clsx';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon paths
Icon.Default.prototype.options.iconUrl = markerIconPng;
Icon.Default.prototype.options.shadowUrl = markerShadowPng;
Icon.Default.prototype.options.iconSize = [25, 41];
Icon.Default.prototype.options.iconAnchor = [12, 41];
Icon.Default.prototype.options.popupAnchor = [1, -34];
Icon.Default.prototype.options.shadowSize = [41, 41];

// Create custom vehicle icon - more realistic modern car
const createVehicleIcon = (isMoving: boolean, heading: number = 0, vehicleId: string = 'V1') => {
  const color = isMoving ? '#10b981' : '#6b7280';
  const vehicleNumber = vehicleId.slice(-1) || '1';
  
  const svgIcon = `
    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Drop shadow -->
      <ellipse cx="25" cy="44" rx="20" ry="4" fill="rgba(0,0,0,0.2)"/>
      
      <!-- Background circle -->
      <circle cx="25" cy="25" r="23" fill="white" stroke="${color}" stroke-width="3" opacity="0.95"/>
      
      <!-- Car body rotated based on heading -->
      <g transform="rotate(${heading} 25 25)">
        
        <!-- Main car body (modern sedan shape) -->
        <path d="M16 18 L34 18 Q36 18 36 20 L36 28 Q36 30 34 30 L16 30 Q14 30 14 28 L14 20 Q14 18 16 18 Z" 
              fill="${color}" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
        
        <!-- Car hood/front -->
        <path d="M14 20 Q14 16 18 16 L32 16 Q36 16 36 20" 
              fill="${color}" opacity="0.9"/>
        
        <!-- Car roof -->
        <path d="M18 18 L32 18 Q34 18 34 20 L34 26 Q34 28 32 28 L18 28 Q16 28 16 26 L16 20 Q16 18 18 18 Z" 
              fill="${color}" opacity="0.85"/>
        
        <!-- Front windshield -->
        <path d="M18 18 L32 18 Q33 18 33 19 L33 22 Q33 23 32 23 L18 23 Q17 23 17 22 L17 19 Q17 18 18 18 Z" 
              fill="rgba(135,206,235,0.8)" stroke="rgba(0,0,0,0.1)" stroke-width="0.3"/>
        
        <!-- Rear windshield -->
        <path d="M18 25 L32 25 Q33 25 33 26 L33 28 Q33 29 32 29 L18 29 Q17 29 17 28 L17 26 Q17 25 18 25 Z" 
              fill="rgba(135,206,235,0.7)" stroke="rgba(0,0,0,0.1)" stroke-width="0.3"/>
        
        <!-- Side windows -->
        <rect x="17.5" y="19.5" width="3" height="3" rx="0.5" fill="rgba(135,206,235,0.6)"/>
        <rect x="29.5" y="19.5" width="3" height="3" rx="0.5" fill="rgba(135,206,235,0.6)"/>
        <rect x="17.5" y="25.5" width="3" height="2.5" rx="0.5" fill="rgba(135,206,235,0.6)"/>
        <rect x="29.5" y="25.5" width="3" height="2.5" rx="0.5" fill="rgba(135,206,235,0.6)"/>
        
        <!-- Wheels (more realistic with rims) -->
        <circle cx="19" cy="32" r="3.5" fill="#2d3748" stroke="#1a202c" stroke-width="0.5"/>
        <circle cx="31" cy="32" r="3.5" fill="#2d3748" stroke="#1a202c" stroke-width="0.5"/>
        <circle cx="19" cy="14" r="3.5" fill="#2d3748" stroke="#1a202c" stroke-width="0.5"/>
        <circle cx="31" cy="14" r="3.5" fill="#2d3748" stroke="#1a202c" stroke-width="0.5"/>
        
        <!-- Wheel rims -->
        <circle cx="19" cy="32" r="2.2" fill="#4a5568"/>
        <circle cx="31" cy="32" r="2.2" fill="#4a5568"/>
        <circle cx="19" cy="14" r="2.2" fill="#4a5568"/>
        <circle cx="31" cy="14" r="2.2" fill="#4a5568"/>
        
        <!-- Rim spokes -->
        <g stroke="#718096" stroke-width="0.8" opacity="0.8">
          <line x1="19" y1="30.2" x2="19" y2="33.8"/>
          <line x1="17.2" y1="32" x2="20.8" y2="32"/>
          <line x1="31" y1="30.2" x2="31" y2="33.8"/>
          <line x1="29.2" y1="32" x2="32.8" y2="32"/>
          <line x1="19" y1="12.2" x2="19" y2="15.8"/>
          <line x1="17.2" y1="14" x2="20.8" y2="14"/>
          <line x1="31" y1="12.2" x2="31" y2="15.8"/>
          <line x1="29.2" y1="14" x2="32.8" y2="14"/>
        </g>
        
        <!-- Headlights (brighter when moving) -->
        ${isMoving ? `
        <ellipse cx="13" cy="18" rx="1.5" ry="2.5" fill="#FFD700" opacity="0.9"/>
        <ellipse cx="13" cy="28" rx="1.5" ry="2.5" fill="#FFD700" opacity="0.9"/>
        <ellipse cx="13" cy="18" rx="0.8" ry="1.3" fill="#FFF" opacity="0.8"/>
        <ellipse cx="13" cy="28" rx="0.8" ry="1.3" fill="#FFF" opacity="0.8"/>
        ` : `
        <ellipse cx="13" cy="18" rx="1.5" ry="2.5" fill="#e2e8f0" opacity="0.7"/>
        <ellipse cx="13" cy="28" rx="1.5" ry="2.5" fill="#e2e8f0" opacity="0.7"/>
        `}
        
        <!-- Taillights -->
        <ellipse cx="37" cy="18" rx="1" ry="2" fill="#DC2626" opacity="0.8"/>
        <ellipse cx="37" cy="28" rx="1" ry="2" fill="#DC2626" opacity="0.8"/>
        
        <!-- Front grille -->
        <rect x="12" y="21" width="1.5" height="4" rx="0.3" fill="${color}" opacity="0.8"/>
        <line x1="12.2" y1="22" x2="13.3" y2="22" stroke="white" stroke-width="0.3" opacity="0.6"/>
        <line x1="12.2" y1="23" x2="13.3" y2="23" stroke="white" stroke-width="0.3" opacity="0.6"/>
        <line x1="12.2" y1="24" x2="13.3" y2="24" stroke="white" stroke-width="0.3" opacity="0.6"/>
        
        <!-- Direction indicator arrow -->
        <path d="M 10 23 L 7 23 L 8.5 20.5 L 8.5 25.5 Z" 
              fill="${isMoving ? '#10b981' : '#6b7280'}" 
              opacity="0.9" 
              stroke="white" 
              stroke-width="0.3"/>
        
        <!-- License plate area -->
        <rect x="14.5" y="30.5" width="21" height="3" rx="0.5" fill="white" stroke="#ddd" stroke-width="0.5"/>
        <text x="25" y="32.7" text-anchor="middle" font-size="6" font-weight="bold" fill="#333" font-family="Arial, sans-serif">GPS-${vehicleNumber}</text>
        
        <!-- Car antenna -->
        <line x1="27" y1="16" x2="27" y2="13" stroke="${color}" stroke-width="0.8"/>
        <circle cx="27" cy="12.5" r="0.5" fill="${color}"/>
      </g>
      
      <!-- Vehicle ID badge (top right) -->
      <circle cx="40" cy="10" r="8" fill="${color}" stroke="white" stroke-width="2.5"/>
      <text x="40" y="13.5" text-anchor="middle" font-size="10" font-weight="bold" fill="white">${vehicleNumber}</text>
      
      <!-- Status indicator (top left) -->
      <circle cx="10" cy="10" r="6" fill="${isMoving ? '#10b981' : '#6b7280'}" stroke="white" stroke-width="2.5"/>
      ${isMoving ? `
      <circle cx="10" cy="10" r="3" fill="white"/>
      <circle cx="10" cy="10" r="1.8" fill="#10b981"/>
      <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>
      ` : `
      <rect x="7.5" y="7.5" width="5" height="5" rx="0.5" fill="white"/>
      `}
      
      <!-- Speed/GPS indicator (bottom center) -->
      ${isMoving ? `
      <rect x="18" y="42" width="14" height="4" rx="2" fill="${color}" opacity="0.9"/>
      <text x="25" y="44.8" text-anchor="middle" font-size="7" font-weight="bold" fill="white">LIVE</text>
      ` : `
      <rect x="20" y="42" width="10" height="4" rx="2" fill="#9CA3AF" opacity="0.7"/>
      <text x="25" y="44.8" text-anchor="middle" font-size="6" fill="white">OFF</text>
      `}
    </svg>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25]
  });
};

interface LiveMapProps {
  vehicleId?: string;
}

// Dummy vehicle simulation - Bangalore coordinates
const DUMMY_ROUTE: Location[] = Array.from({ length: 20 }, (_, i) => ({
  latitude: 12.917936 + (i * 0.0005) * Math.cos(i * 0.3), // More realistic movement pattern
  longitude: 77.592258 + (i * 0.0005) * Math.sin(i * 0.3),
  speed: Math.random() * 40 + 20, // Random speed between 20-60 km/h
  heading: (i * 18) % 360, // Varying direction
  timestamp: new Date(),
}));

const DUMMY_BASE: Omit<VehicleStatus, 'location'> = {
  vehicleId: 'dummy-vehicle',
  isMoving: false, // Start with ignition off
  batteryLevel: 85,
  ignitionOn: false, // Start with ignition off
  engineLocked: false,
  gsmSignal: 92,
  gpsSignal: 98,
  lastUpdate: new Date(),
};

const LiveMap: React.FC<LiveMapProps> = () => {
  const { vehicleStatus = {}, connected = false } = useSocket();
  const [routeHistory, setRouteHistory] = useState<Location[]>([]);
  const [center, setCenter] = useState<LatLngTuple>([12.917936, 77.592258]); // Bangalore coordinates
  const [isFollowing, setIsFollowing] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [dummyVehicle, setDummyVehicle] = useState<VehicleStatus | null>(null);
  const [routeIndex, setRouteIndex] = useState(0);
  const [movementInterval, setMovementInterval] = useState<number | null>(null);
  const mapRef = useRef<any>(null);

  // Use first real vehicle, otherwise dummy
  const realVehicles = Object.values(vehicleStatus);
  const currentVehicle = realVehicles.length > 0 ? realVehicles[0] : dummyVehicle;

  // Initialize dummy vehicle
  useEffect(() => {
    if (!dummyVehicle) {
      console.log('Initializing dummy vehicle at Bangalore coordinates...');
      const initialVehicle = {
        ...DUMMY_BASE,
        location: DUMMY_ROUTE[0],
        lastUpdate: new Date(),
      };
      setDummyVehicle(initialVehicle);
      setRouteHistory([DUMMY_ROUTE[0]]);
      setCenter([DUMMY_ROUTE[0].latitude, DUMMY_ROUTE[0].longitude]);
    }
  }, [dummyVehicle]);

  // Handle ignition toggle and movement
  const toggleIgnition = async () => {
    if (!dummyVehicle) return;

    const newIgnitionState = !dummyVehicle.ignitionOn;
    console.log(`Toggling ignition: ${newIgnitionState ? 'ON' : 'OFF'}`);

    // Update vehicle state immediately
    const updatedVehicle = {
      ...dummyVehicle,
      ignitionOn: newIgnitionState,
      isMoving: newIgnitionState,
      lastUpdate: new Date(),
    };
    setDummyVehicle(updatedVehicle);

    // Send ignition toggle to backend for trip tracking
    try {
      const response = await fetch('http://localhost:3001/toggle-ignition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      console.log('Ignition toggle response:', result);
    } catch (error) {
      console.error('Error toggling ignition:', error);
    }

    if (newIgnitionState) {
      // Start movement
      startMovement();
    } else {
      // Stop movement
      stopMovement();
    }
  };

  const startMovement = () => {
    if (movementInterval) return; // Already moving

    console.log('Starting vehicle movement...');
    let currentIndex = routeIndex;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % DUMMY_ROUTE.length;
      setRouteIndex(currentIndex);

      const newLocation = DUMMY_ROUTE[currentIndex];
      const updatedVehicle = {
        ...DUMMY_BASE,
        ignitionOn: true,
        isMoving: true,
        location: newLocation,
        lastUpdate: new Date(),
      };

      setDummyVehicle(updatedVehicle);
      setRouteHistory(prev => [...prev.slice(-50), newLocation]);

      if (isFollowing) {
        setCenter([newLocation.latitude, newLocation.longitude]);
      }
    }, 2000); // Move every 2 seconds

    setMovementInterval(interval);
  };

  const stopMovement = () => {
    if (movementInterval) {
      console.log('Stopping vehicle movement...');
      clearInterval(movementInterval);
      setMovementInterval(null);
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (movementInterval) {
        clearInterval(movementInterval);
      }
    };
  }, [movementInterval]);

  // Real vehicle route history and center
  useEffect(() => {
    if (currentVehicle && isFollowing) {
      const newCenter: LatLngTuple = [
        currentVehicle.location.latitude,
        currentVehicle.location.longitude
      ];
      setCenter(newCenter);
      
      // Only add to route history if it's a new location
      setRouteHistory(prev => {
        const lastLocation = prev[prev.length - 1];
        if (!lastLocation || 
            lastLocation.latitude !== currentVehicle.location.latitude || 
            lastLocation.longitude !== currentVehicle.location.longitude) {
          return [...prev.slice(-50), currentVehicle.location];
        }
        return prev;
      });
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
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
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
            onClick={toggleIgnition}
            className={clsx(
              'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium',
              currentVehicle?.ignitionOn 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            )}
          >
            <span>{currentVehicle?.ignitionOn ? 'Turn OFF' : 'Turn ON'}</span>
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
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
        {!currentVehicle ? (
          <div className="h-full flex items-center justify-center min-h-[600px]">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Starting demo vehicle...</h3>
              <p className="text-gray-500">Please wait while the simulation loads</p>
              <div className="mt-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin mx-auto"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[600px] w-full">
            <MapContainer
              center={center}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
              whenReady={() => {
                console.log('Map is ready and tiles should be loading');
              }}
            >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Vehicle Marker */}
            <Marker
              position={[currentVehicle.location.latitude, currentVehicle.location.longitude]}
              icon={createVehicleIcon(currentVehicle.isMoving, currentVehicle.location.heading, currentVehicle.vehicleId)}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMap;