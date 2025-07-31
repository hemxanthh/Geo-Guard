# GeoGuard User Guide

## 🚀 Getting Started

### How to Access All Features

This guide will show you exactly where all the implemented features are located and how to access them.

## 🔐 Login & User Roles

### Default Login Credentials
- **Admin User**: 
  - Username: `admin`
  - Password: `admin123`
  - Role: Administrator (Full Access)

- **Demo User**:
  - Username: `demo`  
  - Password: `demo123`
  - Role: User (Limited Access)

- **Test User**:
  - Username: `12345`
  - Password: `12345`
  - Role: User (Limited Access)

## 📍 Main Features & Where to Find Them

### 1. Vehicle Tracking & Controls

**Location**: Dashboard → Live Map section (or direct Live Map tab)

**Features Available**:
- ✅ **Real-time vehicle location** (Now set to Bangalore: 12.917795, 77.592319)
- ✅ **Google Maps-style vehicle icon** (Professional blue car icon)
- ✅ **Ignition Control Button** - Turn vehicle on/off
- ✅ **Center on Vehicle** - Auto-focus map on vehicle
- ✅ **Route Trail Toggle** - Show/hide vehicle path
- ✅ **Follow Mode** - Camera follows vehicle movement
- ✅ **Vehicle Unlock** - Remote unlock feature

**How to Access**:
1. Login to the application
2. Click on "Live Map" in the sidebar OR
3. Go to Dashboard and click on the map section

### 2. Admin Features (For Admin Users Only)

**Location**: Header → Profile Dropdown → Admin Dashboard

**How to Access**:
1. Login with admin credentials
2. Look for the **Crown badge (👑)** next to your profile
3. Click on your profile dropdown
4. Select "Admin Dashboard"

**Admin Features Available**:
- 📊 **System Statistics** - Users, vehicles, alerts overview
- 👥 **User Management** - Add, edit, delete users
- 🚗 **Fleet Management** - Vehicle monitoring and control
- 🛡️ **Security Center** - System security and access logs
- 📱 **Device Management** - Hardware device monitoring
- 🚨 **Alert Management** - System alerts and notifications
- ⚙️ **System Settings** - Global configuration
- 📈 **Analytics Dashboard** - Usage and performance metrics
- 🔐 **Access Control** - Role and permission management
- 🗄️ **Data Management** - Backup and data operations

### 3. Navigation & Sidebar Features

**Location**: Left sidebar (always visible)

**Available Pages**:
- 🏠 **Dashboard** - Main overview page
- 👑 **Admin** - Admin dashboard (admin users only)
- 🗺️ **Live Map** - Real-time vehicle tracking
- 🛣️ **Trips** - Trip history and analytics
- 🚨 **Alerts** - System alerts and notifications
- 🎮 **Remote** - Remote control features
- ⚙️ **Settings** - User preferences

### 4. Control Buttons on Live Map

**Location**: Live Map page → Control panel (top-right)

**Available Controls**:
1. **🔥 Ignition Toggle** - Start/stop vehicle engine
2. **🎯 Center Vehicle** - Focus map on vehicle location  
3. **🛤️ Route Trail** - Show/hide vehicle movement path
4. **📍 Follow Mode** - Camera follows vehicle
5. **🔓 Unlock Vehicle** - Remote unlock
6. **🔔 Notifications** - Alert status indicator

## 🎯 Quick Access Guide

### For Regular Users:
1. **Login** → Dashboard shows vehicle overview
2. **Click Live Map** → Full vehicle tracking interface
3. **Use Controls** → Ignition on/off, center, trail, etc.
4. **Check Trips** → View movement history
5. **View Alerts** → System notifications

### For Admin Users:
1. **Login as Admin** → See Crown badge (👑)
2. **Access Admin Panel** → Profile dropdown → Admin Dashboard
3. **Manage System** → Users, vehicles, security, analytics
4. **Monitor Fleet** → Real-time system oversight
5. **Configure Settings** → System-wide controls

## 🔧 Technical Notes

### Vehicle Location
- **Current Coordinates**: 12.917795, 77.592319 (Bangalore, India)
- **Icon Style**: Google Maps-inspired vehicle icon
- **Real-time Updates**: Via WebSocket connection

### Ignition System
- **On State**: Vehicle moves and responds to commands
- **Off State**: Vehicle stops all movement immediately
- **Visual Feedback**: Button changes color/state

### Admin Access
- **Role-based**: Only admin users see admin features
- **Security**: Admin routes protected by authentication
- **Visual Indicator**: Crown badge for easy identification

## 🛠️ Troubleshooting

### If you can't see features:
1. **Check your login role** - Admin features need admin account
2. **Refresh the page** - Sometimes components need reload
3. **Clear browser cache** - For updated features
4. **Check network connection** - For real-time updates

### If ignition doesn't work:
1. **Click the ignition button** - Should toggle red/green
2. **Check connection status** - Green dot in header
3. **Wait a moment** - Changes take 1-2 seconds

### If admin features missing:
1. **Login as admin user** - Use admin@geoguard.com
2. **Look for Crown badge** - Should appear next to profile
3. **Click profile dropdown** - Admin option should be there

## 📱 Mobile & Desktop

All features work on both desktop and mobile devices. The interface adapts automatically to screen size.

---

**Need Help?** All features are now integrated and accessible through the main navigation. Use this guide to find exactly what you're looking for!
