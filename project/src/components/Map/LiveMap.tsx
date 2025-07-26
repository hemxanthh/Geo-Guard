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

// Create custom vehicle icon
const createVehicleIcon = (isMoving: boolean, heading: number = 0, vehicleId: string = 'V1') => {
  const color = isMoving ? '#10b981' : '#6b7280';
  const vehicleNumber = vehicleId.slice(-1) || '1';
  
  const svgIcon = `
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Drop shadow -->
      <ellipse cx="24" cy="42" rx="18" ry="3" fill="rgba(0,0,0,0.15)"/>
      
      <!-- Background circle -->
      <circle cx="24" cy="24" r="22" fill="white" stroke="${color}" stroke-width="3"/>
      
      <!-- Car body rotated based on heading -->
      <g transform="rotate(${heading} 24 24)">
        <!-- Main car chassis -->
        <rect x="18" y="16" width="12" height="10" rx="2" fill="${color}"/>
        
        <!-- Car cabin/roof -->
        <rect x="20" y="14" width="8" height="8" rx="2" fill="${color}" opacity="0.9"/>
        
        <!-- Front bumper -->
        <rect x="17" y="18" width="1.5" height="6" rx="0.5" fill="${color}" opacity="0.9"/>
        
        <!-- Rear bumper -->
        <rect x="29.5" y="18" width="1.5" height="6" rx="0.5" fill="${color}" opacity="0.9"/>
        
        <!-- Wheels (more realistic) -->
        <circle cx="20" cy="27" r="2.2" fill="#2d3748"/>
        <circle cx="28" cy="27" r="2.2" fill="#2d3748"/>
        <circle cx="20" cy="13" r="2.2" fill="#2d3748"/>
        <circle cx="28" cy="13" r="2.2" fill="#2d3748"/>
        
        <!-- Wheel rims -->
        <circle cx="20" cy="27" r="1.3" fill="#4a5568"/>
        <circle cx="28" cy="27" r="1.3" fill="#4a5568"/>
        <circle cx="20" cy="13" r="1.3" fill="#4a5568"/>
        <circle cx="28" cy="13" r="1.3" fill="#4a5568"/>
        
        <!-- Rim details -->
        <circle cx="20" cy="27" r="0.6" fill="#718096"/>
        <circle cx="28" cy="27" r="0.6" fill="#718096"/>
        <circle cx="20" cy="13" r="0.6" fill="#718096"/>
        <circle cx="28" cy="13" r="0.6" fill="#718096"/>
        
        <!-- Front windshield -->
        <rect x="21" y="15" width="6" height="2.5" rx="1" fill="rgba(135,206,235,0.8)"/>
        
        <!-- Side windows -->
        <rect x="21" y="18" width="6" height="2.5" rx="1" fill="rgba(135,206,235,0.7)"/>
        
        <!-- Rear window -->
        <rect x="21" y="21" width="6" height="2" rx="1" fill="rgba(135,206,235,0.6)"/>
        
        <!-- Headlights (active when moving) -->
        ${isMoving ? `
        <ellipse cx="18.5" cy="17" rx="1.2" ry="1" fill="#FFD700" opacity="0.9"/>
        <ellipse cx="18.5" cy="23" rx="1.2" ry="1" fill="#FFD700" opacity="0.9"/>
        <ellipse cx="18.5" cy="17" rx="0.6" ry="0.5" fill="#FFF"/>
        <ellipse cx="18.5" cy="23" rx="0.6" ry="0.5" fill="#FFF"/>
        ` : `
        <ellipse cx="18.5" cy="17" rx="1.2" ry="1" fill="#e2e8f0"/>
        <ellipse cx="18.5" cy="23" rx="1.2" ry="1" fill="#e2e8f0"/>
        `}
        
        <!-- Taillights -->
        <ellipse cx="29.5" cy="17" rx="0.8" ry="0.8" fill="#DC2626" opacity="0.8"/>
        <ellipse cx="29.5" cy="23" rx="0.8" ry="0.8" fill="#DC2626" opacity="0.8"/>
        
        <!-- Front grille -->
        <rect x="17.2" y="19" width="0.6" height="2" fill="${color}" opacity="0.7"/>
        <line x1="17.5" y1="19.5" x2="17.5" y2="20.5" stroke="white" stroke-width="0.2"/>
        
        <!-- Direction indicator (pointing forward) -->
        <path d="M 16 20 L 14 20 L 15 18.5 L 15 21.5 Z" fill="${isMoving ? '#10b981' : '#6b7280'}" opacity="0.9"/>
        
        <!-- Car antenna -->
        <line x1="26" y1="14" x2="26" y2="12" stroke="${color}" stroke-width="0.5"/>
        <circle cx="26" cy="11.5" r="0.3" fill="${color}"/>
      </g>
      
      <!-- Vehicle ID badge (top right) -->
      <circle cx="38" cy="10" r="8" fill="${color}" stroke="white" stroke-width="2.5"/>
      <text x="38" y="13" text-anchor="middle" font-size="9" font-weight="bold" fill="white">${vehicleNumber}</text>
      
      <!-- Status indicator (top left) -->
      <circle cx="10" cy="10" r="5" fill="${isMoving ? '#10b981' : '#6b7280'}" stroke="white" stroke-width="2"/>
      ${isMoving ? `
      <circle cx="10" cy="10" r="2.5" fill="white"/>
      <circle cx="10" cy="10" r="1.5" fill="#10b981"/>
      ` : `
      <rect x="8" y="8" width="4" height="4" fill="white"/>
      `}
      
      <!-- Speed indicator (bottom) -->
      ${isMoving ? `
      <rect x="20" y="40" width="8" height="3" rx="1.5" fill="${color}" opacity="0.8"/>
      <text x="24" y="42.5" text-anchor="middle" font-size="6" fill="white">GPS</text>
      ` : ''}
    </svg>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24]
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