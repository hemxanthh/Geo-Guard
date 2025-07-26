🚗 Geo-Guard X: NavIC-Based Vehicle Movement Alert System
Geo-Guard X is a lightweight vehicle security prototype that detects unauthorized vehicle movement using NavIC GNSS and ESP32. Designed for classroom demonstration, the system tracks vehicle location in real time and triggers alerts if the vehicle moves when ignition is OFF.

🚫 No GSM module required – fully functional with ESP32 + NavIC + Web Dashboard.

🔧 Features
Ignition Status Detection: Uses a simple SPST switch to simulate ignition ON/OFF.
Safe Zone Lock: When ignition is OFF, current coordinates are locked as a "safe zone".
Movement Detection: If vehicle moves from locked coordinates, an alert is triggered.
Live Location Dashboard: Real-time tracking on a web-based map interface.
Trip History Logging: Records start and end time, route, and distance.
Modular Design: Built to support future upgrades (e.g., remote engine immobilization via relay).
🧠 How It Works
When Ignition is OFF:

Coordinates are locked.
System goes into "Alert Mode".
If Vehicle Moves:

ESP32 detects change in location.
Sends location updates to the user interface over Wi-Fi (e.g., WebSocket/HTTP).
User Interface:

Displays real-time vehicle position.
Shows alert if movement is detected in Alert Mode.
Logs and stores trip data when ignition turns ON.
⚙️ Tech Stack
Hardware
ESP32 (Wi-Fi enabled microcontroller)
NavIC GNSS Module (e.g., u-blox, SkyTraq, etc.)
SPST Switch (simulated ignition)
Power Source (battery or USB)
Software
Frontend: React + Vite + TypeScript + TailwindCSS
Backend: ESP32 handles logic & sends data via WebSocket/REST
Database: IndexedDB/localStorage (or Firebase, Supabase optionally)
🚀 Future Enhancements
🔐 Remote Engine Immobilization (via relay module)
📍 Geofencing Zones and Alerts
🧠 AI/ML Trip Pattern Analysis
📦 Cloud Sync for History Backup
