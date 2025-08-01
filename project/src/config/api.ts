// API Configuration for different environments
const currentDomain = typeof window !== 'undefined' ? window.location.origin : '';

export const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3001',
    socketURL: 'http://localhost:3001'
  },
  production: {
    baseURL: import.meta.env.VITE_API_BASE_URL || currentDomain,
    socketURL: import.meta.env.VITE_SOCKET_URL || currentDomain
  }
};

const ENV = import.meta.env.MODE || 'development';
export const API_BASE_URL = API_CONFIG[ENV as keyof typeof API_CONFIG].baseURL;
export const SOCKET_URL = API_CONFIG[ENV as keyof typeof API_CONFIG].socketURL;

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  
  // Vehicle Management
  VEHICLES: '/vehicles',
  VEHICLE_STATUS: '/vehicle-status',
  TOGGLE_IGNITION: '/toggle-ignition',
  
  // Trip Management
  TRIPS: '/trips',
  TRIP_HISTORY: '/trip-history',
  
  // Admin
  ADMIN_USERS: '/admin/users',
  ADMIN_STATS: '/admin/stats',
  
  // Alerts
  ALERTS: '/alerts',
  SECURITY_ALERTS: '/security-alerts'
};

// Production-ready fetch wrapper with error handling
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
