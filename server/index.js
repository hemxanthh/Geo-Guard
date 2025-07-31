const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Production-ready CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CORS_ORIGIN, 'https://yourdomain.com']
    : ["http://localhost:5173", "http://localhost:5174", "http://localhost:4173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const io = new Server(server, {
  cors: corsOptions
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../project/dist')));
}

const PORT = process.env.PORT || 3001;

// Enhanced logging
const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data);
};

// --- Database Setup with better-sqlite3 ---
const db = new Database('./database.db');

// Create tables
try {
  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    createdAt TEXT NOT NULL,
    isAdmin INTEGER DEFAULT 0
  )`);
  
  db.exec(`CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    startTime TEXT NOT NULL,
    endTime TEXT,
    startLocation TEXT,
    endLocation TEXT,
    distance REAL,
    duration INTEGER,
    status TEXT DEFAULT 'active'
  )`);
  
  db.exec(`CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'info',
    timestamp TEXT NOT NULL,
    acknowledged INTEGER DEFAULT 0
  )`);
  
  log('info', 'Database tables created successfully');
} catch (err) {
  console.error('Error creating database tables:', err);
  process.exit(1);
}

// Prepared statements for better performance
const statements = {
  getUserByCredentials: db.prepare('SELECT * FROM users WHERE username = ? AND password = ?'),
  getUserByUsername: db.prepare('SELECT * FROM users WHERE username = ?'),
  getUserById: db.prepare('SELECT * FROM users WHERE id = ?'),
  createUser: db.prepare('INSERT INTO users (username, password, createdAt) VALUES (?, ?, ?)'),
  updateUser: db.prepare('UPDATE users SET email = ?, phone = ? WHERE id = ?'),
  getAllTrips: db.prepare('SELECT * FROM trips ORDER BY startTime DESC')
};

// --- Mock Data ---
let vehicleData = {
  'vehicle001': {
    id: 'vehicle001',
    location: {
      latitude: 12.917795,
      longitude: 77.592319
    },
    speed: 0,
    heading: 0,
    ignitionOn: false,
    engine: false,
    isMoving: false,
    battery: 85,
    fuel: 75,
    timestamp: new Date().toISOString(),
    status: 'parked'
  }
};

// --- Socket.IO Logic ---
io.on('connection', (socket) => {
  log('info', 'Client connected:', { socketId: socket.id });
  
  // Send current vehicle status
  socket.emit('vehicle-status', vehicleData);
  
  socket.on('request-vehicle-status', () => {
    socket.emit('vehicle-status', vehicleData);
  });
  
  socket.on('disconnect', () => {
    log('info', 'Client disconnected:', { socketId: socket.id });
  });
});

// Simulate vehicle movement and data updates
const simulateVehicleData = () => {
  const vehicle = vehicleData['vehicle001'];
  
  // Random movement simulation
  if (Math.random() > 0.7) {
    vehicle.location.latitude += (Math.random() - 0.5) * 0.001;
    vehicle.location.longitude += (Math.random() - 0.5) * 0.001;
    vehicle.speed = Math.floor(Math.random() * 80);
    vehicle.heading = Math.floor(Math.random() * 360);
    vehicle.isMoving = vehicle.speed > 0;
    vehicle.timestamp = new Date().toISOString();
    
    // Broadcast updates
    io.emit('vehicle-status', vehicleData);
  }
};

// Update vehicle data every 5 seconds
setInterval(simulateVehicleData, 5000);

// --- API Routes ---
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/vehicles', (req, res) => {
  res.json(vehicleData);
});

// Authentication Routes
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }
    
    const user = statements.getUserByCredentials.get(username, password);
    
    if (user) {
      log('info', 'User logged in successfully:', { username });
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          isAdmin: user.isAdmin
        }
      });
    } else {
      log('warn', 'Failed login attempt:', { username });
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    log('error', 'Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/register', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }
    
    const existingUser = statements.getUserByUsername.get(username);
    
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    
    const createdAt = new Date().toISOString();
    const result = statements.createUser.run(username, password, createdAt);
    
    if (result.changes > 0) {
      log('info', 'User registered successfully:', { username });
      res.status(201).json({ message: 'User registered successfully' });
    } else {
      res.status(500).json({ message: 'Failed to create user' });
    }
  } catch (error) {
    log('error', 'Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User profile routes
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = statements.getUserById.get(id);
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    log('error', 'Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone } = req.body;
    
    const result = statements.updateUser.run(email, phone, id);
    
    if (result.changes > 0) {
      const updatedUser = statements.getUserById.get(id);
      const { password, ...userWithoutPassword } = updatedUser;
      
      log('info', 'User updated successfully:', { id });
      res.json({
        message: 'Profile updated successfully',
        user: userWithoutPassword
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    log('error', 'Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Vehicle control routes
app.post('/toggle-ignition', (req, res) => {
  try {
    const vehicle = vehicleData['vehicle001'];
    vehicle.ignitionOn = !vehicle.ignitionOn;
    vehicle.engine = vehicle.ignitionOn;
    vehicle.timestamp = new Date().toISOString();
    
    log('info', 'Ignition toggled:', { ignitionOn: vehicle.ignitionOn });
    
    // Broadcast update
    io.emit('vehicle-status', vehicleData);
    
    res.json({
      message: `Ignition ${vehicle.ignitionOn ? 'turned on' : 'turned off'}`,
      ignitionOn: vehicle.ignitionOn
    });
  } catch (error) {
    log('error', 'Toggle ignition error:', error);
    res.status(500).json({ message: 'Failed to toggle ignition' });
  }
});

// Trip history routes
app.get('/api/trips', (req, res) => {
  try {
    const trips = statements.getAllTrips.all();
    res.json(trips);
  } catch (error) {
    log('error', 'Get trips error:', error);
    res.status(500).json({ message: 'Failed to retrieve trips' });
  }
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  // Handle specific routes that should serve the React app
  app.get(['/', '/dashboard', '/login', '/register', '/settings', '/trips'], (req, res) => {
    res.sendFile(path.join(__dirname, '../project/dist/index.html'));
  });
  
  // Fallback for any other non-API routes
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../project/dist/index.html'));
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  log('info', 'Received SIGINT, shutting down gracefully');
  db.close();
  server.close(() => {
    log('info', 'Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  log('info', `Server running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    cors: corsOptions.origin
  });
});
