import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import { Icon } from 'leaflet';
import { useSocket } from '../../contexts/SocketContext';
import { Power, Navigation, Route, Unlock } from 'lucide-react';
import { buildApiUrl } from '../../config/api';
import clsx from 'clsx';
import 'leaflet/dist/leaflet.css';

// Import marker images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icons
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Fix marker icon defaults
Icon.Default.prototype.options.iconSize = [25, 41];
Icon.Default.prototype.options.iconAnchor = [12, 41];
Icon.Default.prototype.options.popupAnchor = [1, -34];
Icon.Default.prototype.options.shadowSize = [41, 41];

// Create custom vehicle icon - Google Maps style
const createVehicleIcon = (isMoving: boolean, heading: number = 0) => {
  const color = isMoving ? '#10B981' : '#6B7280';
  const shadowColor = isMoving ? 'rgba(16, 185, 129, 0.3)' : 'rgba(107, 114, 128, 0.3)';
  
  const svgIcon = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="35" rx="15" ry="3" fill="${shadowColor}"/>
      <circle cx="20" cy="20" r="18" fill="white" stroke="${color}" stroke-width="2" opacity="0.95"/>
      <g transform="rotate(${heading} 20 20)">
        <rect x="14" y="12" width="12" height="16" rx="2" ry="2" 
              fill="${color}" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
        <path d="M18 12 L22 12 L24 8 L16 8 Z" 
              fill="${color}" opacity="0.9"/>
        <rect x="15" y="14" width="10" height="10" rx="1" ry="1" 
              fill="${color}" opacity="0.8"/>
        <rect x="16" y="13" width="8" height="2" rx="1" ry="1" 
              fill="rgba(255,255,255,0.4)"/>
        <rect x="16" y="25" width="8" height="2" rx="1" ry="1" 
              fill="rgba(255,255,255,0.4)"/>
        <rect x="15.5" y="16" width="2" height="6" rx="0.5" ry="0.5" 
              fill="rgba(255,255,255,0.3)"/>
        <rect x="22.5" y="16" width="2" height="6" rx="0.5" ry="0.5" 
              fill="rgba(255,255,255,0.3)"/>
        <circle cx="16" cy="14" r="1.5" fill="#333"/>
        <circle cx="24" cy="14" r="1.5" fill="#333"/>
        <circle cx="16" cy="26" r="1.5" fill="#333"/>
        <circle cx="24" cy="26" r="1.5" fill="#333"/>
        <circle cx="20" cy="20" r="2" fill="${isMoving ? '#EF4444' : '#9CA3AF'}" opacity="0.8"/>
      </g>
      ${isMoving ? `
        <circle cx="20" cy="20" r="18" fill="none" stroke="${color}" stroke-width="1" opacity="0.5">
          <animate attributeName="r" values="18;22;18" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
        </circle>
      ` : ''}
    </svg>
  `;
  
  return new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    className: isMoving ? 'vehicle-icon-moving' : 'vehicle-icon-stopped'
  });
};

export default function LiveMap() {
  const { vehicleStatus } = useSocket();
  const [center, setCenter] = useState<LatLngTuple>([12.917795, 77.592319]);
  const [zoom, setZoom] = useState(15);
  const [followVehicle, setFollowVehicle] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [showRouteTrail, setShowRouteTrail] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const mapRef = useRef<any>(null);

  // Get all vehicles from socket data
  const vehicles = Object.entries(vehicleStatus);
  const currentVehicle = vehicles.length > 0 ? vehicles[0][1] : null;

  // Safe coordinate access
  const getVehicleCoordinates = (vehicle: any): LatLngTuple => {
    if (!vehicle?.location) return [12.917795, 77.592319];
    
    const lat = vehicle.location.latitude || vehicle.location.lat || 12.917795;
    const lng = vehicle.location.longitude || vehicle.location.lng || 77.592319;
    
    return [lat, lng];
  };

  // Update map center when vehicle moves (if following)
  useEffect(() => {
    if (followVehicle && currentVehicle) {
      const coords = getVehicleCoordinates(currentVehicle);
      setCenter(coords);
    }
  }, [currentVehicle, followVehicle]);

  // Map component to handle map instance
  const MapController = () => {
    const map = useMap();
    
    useEffect(() => {
      mapRef.current = map;
      if (followVehicle && currentVehicle) {
        const coords = getVehicleCoordinates(currentVehicle);
        map.setView(coords, zoom);
      }
    }, [map, currentVehicle, followVehicle, zoom]);

    return null;
  };

  const handleVehicleClick = (vehicleId: string) => {
    setSelectedVehicle(selectedVehicle === vehicleId ? null : vehicleId);
  };

  const getVehicleStatus = (vehicle: any) => {
    const isMoving = vehicle?.speed > 0 || vehicle?.isMoving || false;
    const ignitionOn = vehicle?.ignitionOn || vehicle?.engine || false;
    const speed = vehicle?.speed || 0;
    const battery = vehicle?.battery || 0;
    const coords = getVehicleCoordinates(vehicle);
    
    return {
      isMoving,
      ignitionOn,
      speed,
      battery,
      coordinates: coords,
      lastUpdate: vehicle?.timestamp || new Date().toISOString()
    };
  };

  // Control Functions
  const handleToggleIgnition = async () => {
    try {
      setNotifications(prev => [
        { id: Date.now(), message: "Processing ignition toggle...", time: "Just now", type: "info" },
        ...prev.slice(0, 4)
      ]);

      const response = await fetch(buildApiUrl('/toggle-ignition'), {
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

      setNotifications(prev => [
        { 
          id: Date.now(), 
          message: result.message || "Ignition toggled successfully", 
          time: "Just now", 
          type: "success" 
        },
        ...prev.slice(1, 4)
      ]);
    } catch (error) {
      console.error("Error toggling ignition:", error);
      setNotifications(prev => [
        { 
          id: Date.now(), 
          message: "Failed to toggle ignition. Please check connection and try again.", 
          time: "Just now", 
          type: "error" 
        },
        ...prev.slice(1, 4)
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

  const handleCenterOnVehicle = () => {
    if (currentVehicle && mapRef.current) {
      const coords = getVehicleCoordinates(currentVehicle);
      mapRef.current.setView(coords, zoom);
      setFollowVehicle(true);
    }
  };

  const handleToggleRouteTrail = () => {
    setShowRouteTrail(!showRouteTrail);
    setNotifications(prev => [
      { 
        id: Date.now(), 
        message: `Route trail ${!showRouteTrail ? 'enabled' : 'disabled'}`, 
        time: "Just now", 
        type: "info" 
      },
      ...prev.slice(0, 4)
    ]);
  };

  return (
    <div className="h-full w-full relative">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <button
          onClick={() => setFollowVehicle(!followVehicle)}
          className={`px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors ${
            followVehicle
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {followVehicle ? 'Following' : 'Free View'}
        </button>
        
        <div className="bg-white rounded-lg shadow-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Zoom</div>
          <input
            type="range"
            min="5"
            max="20"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-20"
            title="Map zoom level"
          />
          <div className="text-xs text-gray-600 mt-1">{zoom}x</div>
        </div>
      </div>

      {/* Vehicle Control Panel */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        {/* Ignition Control */}
        <div className="bg-white rounded-lg shadow-lg p-3">
          <div className="text-xs text-gray-500 mb-2">Engine Control</div>
          <button
            onClick={handleToggleIgnition}
            className={clsx(
              "w-full py-2 px-3 rounded-lg font-medium transition-all duration-200 text-sm flex items-center justify-center space-x-2",
              currentVehicle && getVehicleStatus(currentVehicle).ignitionOn
                ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
            )}
          >
            <Power className="w-4 h-4" />
            <span>
              {currentVehicle && getVehicleStatus(currentVehicle).ignitionOn ? 'Turn OFF' : 'Turn ON'}
            </span>
          </button>
        </div>

        {/* Navigation Controls */}
        <div className="bg-white rounded-lg shadow-lg p-3 space-y-2">
          <div className="text-xs text-gray-500 mb-2">Navigation</div>
          
          <button
            onClick={handleCenterOnVehicle}
            className="w-full py-2 px-3 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 rounded-lg font-medium transition-all duration-200 text-sm flex items-center justify-center space-x-2"
          >
            <Navigation className="w-4 h-4" />
            <span>Center on Vehicle</span>
          </button>

          <button
            onClick={handleToggleRouteTrail}
            className={clsx(
              "w-full py-2 px-3 rounded-lg font-medium transition-all duration-200 text-sm flex items-center justify-center space-x-2",
              showRouteTrail
                ? "bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            )}
          >
            <Route className="w-4 h-4" />
            <span>{showRouteTrail ? 'Hide Trail' : 'Show Trail'}</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-3">
          <div className="text-xs text-gray-500 mb-2">Quick Actions</div>
          <button
            onClick={handleRemoteUnlock}
            className="w-full py-2 px-3 bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200 rounded-lg font-medium transition-all duration-200 text-sm flex items-center justify-center space-x-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Remote Unlock</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="absolute bottom-4 right-4 z-[1000] space-y-2 max-w-sm">
          {notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className={clsx(
                "p-3 rounded-lg shadow-lg text-sm font-medium",
                notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
                notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
                'bg-blue-100 text-blue-800 border border-blue-200'
              )}
            >
              {notification.message}
            </div>
          ))}
        </div>
      )}

     

      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController />
        
        {/* Vehicle Markers */}
        {vehicles.map(([vehicleId, vehicle]) => {
          const coords = getVehicleCoordinates(vehicle);
          const status = getVehicleStatus(vehicle);
          const heading = (vehicle as any)?.heading || 0;
          
          return (
            <Marker
              key={vehicleId}
              position={coords}
              icon={createVehicleIcon(status.isMoving, heading)}
              eventHandlers={{
                click: () => handleVehicleClick(vehicleId)
              }}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold text-gray-800 mb-2">Vehicle {vehicleId}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        status.isMoving ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {status.isMoving ? 'Moving' : 'Stopped'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Speed:</span>
                      <span className="text-gray-800">{status.speed} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ignition:</span>
                      <span className={`font-medium ${
                        status.ignitionOn ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {status.ignitionOn ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coordinates:</span>
                      <span className="text-gray-800 text-xs">
                        {coords[0].toFixed(6)}, {coords[1].toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Update:</span>
                      <span className="text-gray-800 text-xs">
                        {new Date(status.lastUpdate).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* No Vehicle Message */}
      {vehicles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-[1000]">
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No Vehicles Found</h3>
            <p className="text-gray-600 text-sm">
              Waiting for vehicle data from server...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
