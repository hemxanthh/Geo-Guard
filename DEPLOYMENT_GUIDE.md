# Geo Guard - Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. Recurring Data Access Errors
**Problem**: `Cannot read properties of undefined (reading 'toFixed')`
**Root Cause**: Server and frontend expect different data formats
**Solution**: 
- Use safe property access with fallbacks
- Standardize data contracts between server and client
- Implement proper error boundaries

### 2. Ignition Button Not Working
**Problem**: Button clicks don't toggle ignition state
**Root Causes**:
- Incorrect boolean logic: `!currentVehicle.ignitionOn === false`
- Server uses `engine` property, frontend expects `ignitionOn`
- No error feedback for failed API calls

**Solutions**:
- Fixed boolean logic: `currentVehicle.ignitionOn === true`
- Server now provides both `engine` and `ignitionOn` properties
- Added comprehensive error handling with user notifications

### 3. Wrong Location (New York instead of Bangalore)
**Problem**: Vehicle shows at coordinates 40.7128, -74.0060 (NYC)
**Solution**: Updated server coordinates to 12.9716, 77.5946 (Bangalore)

### 4. Data Structure Inconsistencies
**Problems**:
- Server sends `{lat, lng}` but frontend expects `{latitude, longitude}`
- Missing null/undefined checks
- No fallback values for missing data

**Solutions**:
- Server now provides both coordinate formats
- Added helper functions for safe data access
- Implemented fallback values throughout

## Deployment Best Practices

### Environment Variables
Create `.env` files for different environments:

```bash
# .env.production
VITE_API_URL=https://your-api-domain.com
VITE_SOCKET_URL=https://your-api-domain.com

# .env.development  
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

### Server Configuration
For production deployment:
1. Use environment variables for database paths
2. Implement proper CORS settings
3. Add rate limiting
4. Use HTTPS
5. Add proper logging

### Frontend Error Handling
- Implement Error Boundaries for React components
- Add loading states for all API calls
- Provide meaningful error messages to users
- Use retry mechanisms for failed requests

### Database Security
- Never commit database files to Git
- Use environment variables for sensitive data
- Implement proper authentication
- Regular backups

## Monitoring in Production

### Key Metrics to Monitor:
1. API response times
2. WebSocket connection stability
3. Database query performance
4. GPS signal quality
5. Vehicle communication errors

### Alerting Setup:
- Database connection failures
- High API error rates
- Vehicle offline alerts
- Security breach attempts

## Troubleshooting Commands

```bash
# Check if ports are in use
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Kill processes using ports
taskkill /PID <PID> /F

# Check server logs
cd server && npm start

# Check frontend build
cd project && npm run build

# Test API endpoints
curl http://localhost:3001/toggle-ignition -X POST
curl http://localhost:3001/trips
```

## Code Quality Improvements Made

### Safe Data Access Pattern:
```typescript
// Before (Error-prone)
currentVehicle.location.latitude.toFixed(4)

// After (Safe)
const getVehicleLocation = (vehicle: any) => {
  if (!vehicle?.location) return { lat: 0, lng: 0, latitude: 0, longitude: 0 };
  return {
    lat: vehicle.location.lat || vehicle.location.latitude || 0,
    lng: vehicle.location.lng || vehicle.location.longitude || 0,
    latitude: vehicle.location.latitude || vehicle.location.lat || 0,
    longitude: vehicle.location.longitude || vehicle.location.lng || 0
  };
};
```

### Proper Error Handling:
```typescript
// Before
catch (error) {
  console.error("Error toggling ignition:", error);
}

// After  
catch (error) {
  console.error("Error toggling ignition:", error);
  setNotifications(prev => [
    { 
      id: Date.now(), 
      message: "Failed to toggle ignition. Please check connection and try again.", 
      time: "Just now", 
      type: "error" 
    },
    ...prev.slice(0, 4)
  ]);
}
```

This configuration ensures your application runs smoothly in both development and production environments.
