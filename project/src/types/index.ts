// project/src/types/index.ts
export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface Vehicle {
  id: string;
  userId: string;
  name: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  deviceId: string;
  isActive: boolean;
  color: string;
  createdAt: Date;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: Date;
  address?: string;
}

export interface Trip {
  id: string;
  vehicleId: string;
  startLocation: Location;
  endLocation: Location;
  startTime: Date;
  endTime: Date;
  route: Location[];
  status: 'active' | 'completed';
  
  // --- NEW & ENHANCED FIELDS ---
  distance?: number;
  duration?: number;
  maxSpeed?: number;
  avgSpeed?: number;
  fuelConsumed?: number;
}

export interface Alert {
  id: string;
  vehicleId: string;
  type: 'unauthorized_movement' | 'ignition_tamper' | 'geofence_breach' | 'low_battery' | 'emergency' | 'engine_lock' | 'engine_unlock';
  message: string;
  location: Location;
  timestamp: Date;
  isRead: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
}

export interface VehicleStatus {
  vehicleId: string;
  location: Location;
  ignitionOn: boolean;
  engineLocked: boolean;
  batteryLevel: number;
  gsmSignal: number;
  gpsSignal: number;
  isMoving: boolean;
  lastUpdate: Date;
  temperature?: number;
  mileage?: number;
}

export interface RemoteCommand {
  id: string;
  vehicleId: string;
  command: 'lock_engine' | 'unlock_engine' | 'get_status' | 'emergency_stop' | 'horn' | 'lights';
  status: 'pending' | 'sent' | 'acknowledged' | 'failed' | 'timeout';
  timestamp: Date;
  response?: string;
  executedAt?: Date;
}

export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  totalTrips: number;
  totalDistance: number;
  unreadAlerts: number;
  avgSpeed: number;
}