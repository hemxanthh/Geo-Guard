# 🚗 Geo-Guard: Anti-Theft Vehicle Tracking System
## ESP32 + GSM/4G + NavIC with Live Web Dashboard

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933.svg)
![ESP32](https://img.shields.io/badge/ESP32-Hardware-red.svg)
![NavIC](https://img.shields.io/badge/NavIC-IRNSS-orange.svg)

**Geo-Guard** is a comprehensive anti-theft vehicle tracking system that combines ESP32 hardware with GSM/4G connectivity and NavIC (IRNSS) positioning to detect unauthorized vehicle movement and provide real-time tracking through a live web dashboard.

## 🎯 System Overview

### **Goal**
Detect unauthorized vehicle movement when ignition is off, alert the owner via SMS, and enable live tracking through a web dashboard with trip history and real-time monitoring.

### **Core Logic**
1. **Normal State**: When vehicle ignition is OFF, ESP32 reads and stores last known NavIC coordinates
2. **Movement Detection**: If movement detected (vibration sensor/GPS change) without ignition ON, ESP32 sends SMS alert and uploads event to backend API
3. **Live Tracking**: System continuously updates backend with current coordinates, visible in real-time on web dashboard

## 🔧 Hardware Components

### **Core Hardware**
- **ESP32** (Wi-Fi + Bluetooth enabled microcontroller)
- **GSM/4G Module**: SIM7600G, EC200U, or similar for SMS alerts and data transmission
- **NavIC (IRNSS) GNSS Module**: u-blox, SkyTraq, or compatible for precise Indian positioning
- **Ignition Detection**: Connected to vehicle's ignition system (12V → 3.3V conversion)
- **Vibration/Motion Sensor**: MPU6050 or ADXL345 for movement detection
- **Power Management**: 12V → 5V → 3.3V regulators for vehicle power integration

### **Vehicle Integration**
- **Ignition Tap**: Direct connection to vehicle ignition wire (through voltage divider)
- **Power Source**: Vehicle 12V battery with backup power management
- **Installation**: Hidden placement in dashboard or under seats
- **Antenna**: External GSM and GPS antennas for better signal reception
- **Tamper Detection**: Magnetic/tilt sensors for device removal alerts

### **Communication Flow**
```
Vehicle → ESP32 → NavIC/GPS → GSM/4G → Backend API → Web Dashboard
                     ↓
                SMS Alerts to Owner
```

## 🌟 Features

### 🚗 **Vehicle Monitoring**
- **Real-time Location Tracking**: Live GPS coordinates with interactive map visualization
- **Vehicle Status Dashboard**: Engine, doors, AC, lights, fuel level monitoring
- **Speed & Direction Tracking**: Current speed and heading direction display
- **Driver Information**: Active driver details and vehicle license plate

### 📊 **Dashboard & Analytics**  
- **Enhanced Dashboard**: Comprehensive vehicle statistics and status cards
- **Trip History**: Complete trip logging with start/end times and locations
- **Live Map Integration**: Interactive Leaflet-based mapping with realistic vehicle icons
- **Real-time Updates**: WebSocket-powered live data streaming

### 👤 **User Management**
- **Secure Authentication**: Login/registration system with session management
- **User Profiles**: Editable email and phone number settings
- **Database Integration**: Persistent user data storage
- **Admin Controls**: Role-based access management

### � **Security Features**
- **Database Protection**: Sensitive data excluded from version control
- **Error Handling**: Comprehensive error management and retry logic
- **Graceful Shutdown**: Proper database connection cleanup

## 🛠️ Tech Stack

### **Hardware Layer**
- **ESP32-WROOM-32** microcontroller with dual-core processor
- **GSM/4G Module**: SIM7600G-H or EC200U-CN for Indian networks
- **NavIC GNSS**: u-blox NEO-M8L or SkyTraq PX1122R for Indian Regional Navigation Satellite System
- **Motion Sensors**: MPU6050 (accelerometer + gyroscope) for movement detection
- **Power Management**: AMS1117 voltage regulators (12V → 5V → 3.3V)
- **Relays**: For potential engine immobilization (future enhancement)

### **Vehicle Integration Specifications**
```
Connection Points:
├── Ignition Wire (12V) → Voltage Divider → ESP32 GPIO
├── Battery (+12V) → Power Supply Circuit → ESP32 VIN
├── Ground (-) → Common Ground → ESP32 GND
├── Antenna Mounting → External GPS/GSM Antennas
└── OBD-II Port → Optional diagnostic data access
```

### **Communication Protocols**
- **GSM/4G**: HTTP/HTTPS API calls, SMS via AT commands
- **NavIC/GPS**: NMEA 0183 protocol for coordinate parsing
- **ESP32**: UART communication with GSM and GPS modules
- **Backend**: RESTful API endpoints for data transmission

### **Software Stack**
- **Embedded**: Arduino IDE/PlatformIO with ESP32 libraries
- **Backend**: Node.js with Express.js framework
- **Frontend**: React 18.x with TypeScript
- **Database**: SQLite with retry logic for reliability
- **Real-time**: Socket.IO for WebSocket connections
- **Mapping**: Leaflet for interactive maps
- **Styling**: Tailwind CSS for responsive design

### **Network & Data Flow**
```
[Vehicle] → [ESP32] → [GSM/4G] → [Backend API] → [Database]
                                      ↓
[SMS Alerts] ← [GSM]           [WebSocket] → [Frontend Dashboard]
```

### **Database Schema**
```sql
users (id, username, password, email, phone, createdAt)
trips (id, startTime, endTime, startLocation, endLocation, distance, duration, status)
alerts (id, type, message, severity, timestamp, acknowledged)
```

## � Real Vehicle Implementation

### **Installation Process**
1. **Power Connection**: Tap into vehicle's 12V system (fuse box or ignition wire)
2. **Ignition Detection**: Connect to ignition switch wire through voltage divider
3. **Ground Connection**: Secure connection to vehicle chassis ground
4. **Antenna Placement**: Mount GSM and GPS antennas with clear sky view
5. **Device Mounting**: Secure ESP32 unit in hidden, accessible location

### **Anti-Theft Logic Flow**
```
Vehicle State Detection:
├── Ignition ON → Normal tracking mode
├── Ignition OFF → Store current coordinates as "safe zone"
├── Movement Detected → Check ignition status
│   ├── If ON → Log normal trip
│   └── If OFF → THEFT ALERT!
│       ├── Send SMS to owner
│       ├── Upload alert to backend
│       └── Begin continuous tracking
```

### **Alert System**
- **SMS Notifications**: Immediate theft alerts with coordinates
- **Web Dashboard**: Real-time theft status and location
- **Continuous Tracking**: 30-second intervals during theft events
- **Battery Monitoring**: Low power alerts via SMS and dashboard

### **Vehicle Compatibility**
- **12V Systems**: Cars, motorcycles, trucks, buses
- **Ignition Types**: Traditional key, push-button start, remote start
- **Installation**: Non-invasive wiring, reversible installation
- **Weather Resistant**: IP65 rated enclosure for harsh conditions

## �🚀 Quick Start

### **Prerequisites**
- Node.js 18.x or higher
- npm or yarn package manager
- Git for version control
- **For Hardware**: ESP32, GSM module, NavIC GPS, vehicle with 12V system

### **Software Installation**

1. **Clone the repository**
```bash
git clone https://github.com/hemxanthh/Geo-Guard.git
cd Geo-Guard
```

2. **Install Dependencies**

**Backend Setup:**
```bash
cd server
npm install
```

**Frontend Setup:**
```bash
cd ../project
npm install
```

### **Hardware Setup (ESP32)**

1. **Wire Connections**
```cpp
// ESP32 Pin Configuration
#define GSM_RX_PIN 16
#define GSM_TX_PIN 17
#define GPS_RX_PIN 4
#define GPS_TX_PIN 2
#define IGNITION_PIN 34
#define VIBRATION_PIN 35
#define POWER_LED 25
```

2. **Upload ESP32 Code**
```bash
# Install PlatformIO or Arduino IDE
# Configure board: ESP32 Dev Module
# Upload tracking firmware to ESP32
```

3. **SIM Card Setup**
```bash
# Insert activated SIM card in GSM module
# Configure APN settings for your carrier
# Test SMS functionality
```

3. **Start the Application**

**Start Backend Server (Terminal 1):**
```bash
cd server
npm start
```
Server will run on: `http://localhost:3001`

**Start Frontend Development Server (Terminal 2):**
```bash
cd project
npm run dev
```
Frontend will run on: `http://localhost:5173`

4. **Access the Application**
- Open your browser to `http://localhost:5173`
- Register a new account or use demo credentials
- Explore the dashboard and vehicle tracking features

## 📁 Project Structure

```
geo-guard/
├── .gitignore                 # Git ignore file (protects sensitive data)
├── README.md                  # This file
├── package.json              # Root dependencies
├── hardware/                  # ESP32 firmware and schematics
│   ├── esp32_tracker/         # Arduino/PlatformIO project
│   │   ├── src/
│   │   │   ├── main.cpp       # Main ESP32 tracking code
│   │   │   ├── gps_handler.cpp # NavIC/GPS coordinate processing
│   │   │   ├── gsm_handler.cpp # GSM/4G communication
│   │   │   └── theft_detection.cpp # Anti-theft logic
│   │   ├── lib/               # Hardware libraries
│   │   └── platformio.ini     # Build configuration
│   ├── schematics/            # Circuit diagrams and PCB layouts
│   └── installation_guide.md # Hardware installation instructions
├── project/                   # Frontend React application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Auth/          # Login/Registration forms
│   │   │   ├── Dashboard/     # Main dashboard & enhanced version
│   │   │   ├── Map/           # Live map with vehicle tracking
│   │   │   ├── Settings/      # User profile settings
│   │   │   ├── Alerts/        # Theft alerts and notifications
│   │   │   ├── Layout/        # Header, Sidebar components
│   │   │   └── Hardware/      # Hardware status monitoring
│   │   ├── contexts/          # React contexts (Auth, Socket)
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # GPS coordinate utilities
│   ├── package.json
│   └── vite.config.ts
└── server/                    # Backend Node.js application
    ├── index.js               # Main server file
    ├── routes/                # API endpoints
    │   ├── hardware.js        # ESP32 data reception
    │   ├── alerts.js          # Theft alert management
    │   └── tracking.js        # GPS tracking endpoints
    ├── utils/
    │   ├── sms_handler.js     # SMS alert utilities
    │   └── gps_utils.js       # Coordinate processing
    ├── package.json           # Server dependencies
    └── database.db            # SQLite database (ignored by git)
```

## 🔧 Configuration

### **Environment Variables**
Create a `.env` file in the server directory for production:
```env
PORT=3001
NODE_ENV=production
DATABASE_PATH=./database.db
```

### **Default Credentials**
```
Username: admin
Password: admin123

Username: demo  
Password: demo123
```

## 🚨 Security Considerations

### **Database Protection**
- ✅ Database files are excluded from Git via `.gitignore`
- ✅ Sensitive user data is not exposed in repository
- ✅ Ready for password hashing implementation with bcrypt

### **Planned Security Enhancements**
- 🔄 Password hashing with bcrypt
- 🔄 JWT token authentication
- 🔄 Rate limiting for API endpoints
- 🔄 Input validation and sanitization

## 🔄 Development Workflow

### **Available Scripts**

**Frontend (project/):**
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

**Backend (server/):**
```bash
npm start          # Start server with nodemon
npm run production # Start production server
```

### **Database Management**
The SQLite database is automatically created on first run. Tables include:
- **users**: Authentication and profile data
- **trips**: Vehicle trip history and tracking
- **alerts**: System alerts and notifications

## 🚀 Deployment

### **Frontend Deployment**
```bash
cd project
npm run build
# Deploy dist/ folder to your hosting service
```

### **Backend Deployment**
```bash
cd server
# Set NODE_ENV=production
# Configure your process manager (PM2, Docker, etc.)
npm start
```

## 🔮 Future Enhancements

### **Hardware Upgrades**
- 🔐 **Engine Immobilization**: Relay-based remote engine cutoff
- 📡 **5G Integration**: Faster data transmission and lower latency
- 🔋 **Solar Charging**: Self-sustaining power with solar panels
- 📱 **Bluetooth Beacons**: Short-range proximity detection
- 🎤 **Audio Monitoring**: Cabin audio recording during theft events
- 💾 **SD Card Logging**: Local data storage for offline operation

### **Software Features**
- 🔐 **Advanced Security**: JWT authentication, password hashing
- 📱 **Mobile App**: React Native companion app with push notifications
- 🗺️ **Geofencing**: Virtual boundaries with entry/exit alerts
- 📊 **Analytics**: Advanced trip analytics and driving behavior
- 🚨 **Multi-Channel Alerts**: Email, WhatsApp, Telegram integration
- 🎨 **Themes**: Dark/light mode with customizable dashboard
- 🌐 **Multi-language**: Hindi, English, and regional language support

### **AI & Machine Learning**
- 🧠 **Theft Pattern Recognition**: AI-based suspicious activity detection
- 📈 **Predictive Analytics**: Maintenance alerts based on driving patterns
- 🚗 **Driver Behavior Analysis**: Harsh braking, acceleration monitoring
- 📍 **Route Optimization**: Smart route suggestions for fuel efficiency

### **Integration Capabilities**
- 🏢 **Fleet Management**: Multi-vehicle tracking for businesses
- �️ **Insurance Integration**: Automated claim processing for theft
- 🚓 **Police Integration**: Direct alert forwarding to law enforcement
- 📞 **Emergency Services**: Automatic accident detection and response
- 🏠 **Smart Home**: Integration with home automation systems

### **Technical Improvements**
- 🔄 **OTA Updates**: Over-the-air firmware updates for ESP32
- 📝 **API Documentation**: OpenAPI/Swagger integration
- 🧪 **Testing**: Hardware-in-the-loop testing setup
- 🐳 **Containerization**: Docker deployment for scalability
- ☁️ **Cloud Integration**: AWS IoT/Azure IoT Hub connectivity
- 🔒 **Hardware Security**: Encrypted communication and secure boot

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Hemxanthh**
- GitHub: [@hemxanthh](https://github.com/hemxanthh)
- Project: [Geo-Guard](https://github.com/hemxanthh/Geo-Guard)

## � Acknowledgments

- React team for the amazing framework
- Leaflet for interactive mapping capabilities
- Socket.IO for real-time communication
- Tailwind CSS for responsive design utilities
- SQLite for lightweight database solution

---

⭐ **Star this repository if you find it helpful!**
