const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const sqlite3 = require('sqlite3').verbose();
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
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data);
};

// Add error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  log('error', 'Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  log('error', 'Unhandled Rejection at:', { promise, reason });
});

// Database helper function with retry logic
const dbRunWithRetry = (query, params, maxRetries = 3) => {
  return new Promise((resolve, reject) => {
    const attemptQuery = (attempt) => {
      db.run(query, params, function(err) {
        if (err) {
          if (err.code === 'SQLITE_BUSY' && attempt < maxRetries) {
            console.log(`Database busy, retrying... (${attempt}/${maxRetries})`);
            setTimeout(() => attemptQuery(attempt + 1), 100 * attempt);
          } else {
            reject(err);
          }
        } else {
          resolve(this);
        }
      });
    };
    attemptQuery(1);
  });
};

const dbGetWithRetry = (query, params, maxRetries = 3) => {
  return new Promise((resolve, reject) => {
    const attemptQuery = (attempt) => {
      db.get(query, params, (err, row) => {
        if (err) {
          if (err.code === 'SQLITE_BUSY' && attempt < maxRetries) {
            console.log(`Database busy, retrying... (${attempt}/${maxRetries})`);
            setTimeout(() => attemptQuery(attempt + 1), 100 * attempt);
          } else {
            reject(err);
          }
        } else {
          resolve(row);
        }
      });
    };
    attemptQuery(1);
  });
};

// Vehicle state
let activeTripId = null;
let vehicleState = {
    id: 'vehicle_001',
    location: {
        lat: 12.917795,
        lng: 77.592319,
        latitude: 12.917795,
        longitude: 77.592319
    },
    status: 'idle',
    speed: 0,
    direction: 0,
    fuel: 85,
    engine: false,
    ignitionOn: false,
    isMoving: false,
    doors: { front: false, rear: false },
    ac: false,
    lights: false,
    lastUpdate: new Date().toISOString(),
    driverName: 'John Doe',
    licensePlate: 'ABC-123'
};

// Socket connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // Send current vehicle state to new client
    socket.emit('vehicleUpdate', vehicleState);
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Simulate vehicle movement and updates
function simulateVehicleMovement() {
    // Only move vehicle if ignition is on
    if (vehicleState.ignitionOn || vehicleState.engine) {
        // Random movement within a small area
        const deltaLat = (Math.random() - 0.5) * 0.001;
        const deltaLng = (Math.random() - 0.5) * 0.001;
        
        vehicleState.location.lat += deltaLat;
        vehicleState.location.lng += deltaLng;
        // Also set latitude and longitude for frontend compatibility
        vehicleState.location.latitude = vehicleState.location.lat;
        vehicleState.location.longitude = vehicleState.location.lng;
        
        vehicleState.speed = Math.random() * 60; // 0-60 km/h when moving
        vehicleState.direction = Math.random() * 360; // 0-360 degrees
        vehicleState.isMoving = true;
        vehicleState.status = 'moving';
    } else {
        // Vehicle is stationary when ignition is off
        vehicleState.speed = 0;
        vehicleState.isMoving = false;
        vehicleState.status = 'idle';
    }
    
    vehicleState.lastUpdate = new Date().toISOString();
    
    // Emit update to all connected clients
    io.emit('vehicleUpdate', vehicleState);
}

// Authentication endpoints
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            console.error('Login error:', err.message);
            return res.status(500).json({ error: 'Login failed' });
        }
        
        if (!row) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = {
            id: row.id,
            username: row.username,
            email: row.email || '',
            phone: row.phone || '',
            role: row.username === 'admin' ? 'admin' : 'user',
            createdAt: row.createdAt || new Date().toISOString()
        };
        
        console.log('User logged in:', username);
        res.json({ user });
    });
});

app.post('/auth/register', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check if user already exists
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error('Registration check error:', err.message);
            return res.status(500).json({ error: 'Registration failed' });
        }
        
        if (row) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        // Create new user
        const createdAt = new Date().toISOString();
        db.run('INSERT INTO users (username, password, createdAt) VALUES (?, ?, ?)', 
               [username, password, createdAt], function(err) {
            if (err) {
                console.error('Registration error:', err.message);
                return res.status(500).json({ error: 'Registration failed' });
            }
            
            const user = {
                id: this.lastID,
                username: username,
                email: '',
                phone: '',
                role: 'user',
                createdAt: createdAt
            };
            
            console.log('New user registered:', username);
            res.status(201).json({ user });
        });
    });
});

// Get user profile
app.get('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await dbGetWithRetry('SELECT * FROM users WHERE id = ?', [id]);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const userData = {
            id: user.id,
            username: user.username,
            email: user.email || '',
            phone: user.phone || '',
            role: user.username === 'admin' ? 'admin' : 'user',
            createdAt: user.createdAt || new Date().toISOString()
        };
        
        res.json({ user: userData });
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Update user profile endpoint
app.put('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email, phone } = req.body;
        
        if (!id) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        const result = await dbRunWithRetry('UPDATE users SET email = ?, phone = ? WHERE id = ?', [email, phone, id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Return updated user info
        const row = await dbGetWithRetry('SELECT * FROM users WHERE id = ?', [id]);
        
        const user = {
            id: row.id,
            username: row.username,
            email: row.email || '',
            phone: row.phone || '',
            role: row.username === 'admin' ? 'admin' : 'user',
            createdAt: row.createdAt || new Date().toISOString()
        };
        
        console.log('User profile updated:', row.username);
        res.json({ user });
    } catch (error) {
        console.error('Profile update error:', error.message);
        res.status(500).json({ error: 'Profile update failed' });
    }
});

// Additional API endpoints for dashboard functionality

// Toggle ignition endpoint
app.post('/toggle-ignition', (req, res) => {
    vehicleState.engine = !vehicleState.engine;
    vehicleState.ignitionOn = vehicleState.engine; // Add ignitionOn for frontend compatibility
    vehicleState.lastUpdate = new Date().toISOString();
    
    // Emit update to all connected clients
    io.emit('vehicleUpdate', vehicleState);
    
    res.json({ 
        success: true,
        message: `Engine ${vehicleState.engine ? 'started' : 'stopped'}`,
        ignitionOn: vehicleState.engine 
    });
});

// Get trips endpoint  
app.get('/trips', (req, res) => {
    db.all('SELECT * FROM trips ORDER BY startTime DESC', (err, rows) => {
        if (err) {
            console.error('Error fetching trips:', err.message);
            return res.status(500).json({ error: 'Failed to fetch trips' });
        }
        
        // Add some mock data if no trips exist
        if (rows.length === 0) {
            const mockTrips = [
                {
                    id: 1,
                    startTime: new Date(Date.now() - 3600000).toISOString(),
                    endTime: new Date().toISOString(),
                    distance: 12.5,
                    duration: 3600,
                    status: 'completed'
                }
            ];
            return res.json(mockTrips);
        }
        
        res.json(rows);
    });
});

// --- Database and Server Initialization ---
const db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error("Fatal DB Connection Error:", err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
    
    // Skip WAL mode for now to avoid locking issues
    console.log("Using default journal mode to avoid database locks");
    
    // Create tables if they don't exist
    const createTables = () => {
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                createdAt TEXT
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS trips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                startTime TEXT NOT NULL,
                endTime TEXT,
                startLocation TEXT,
                endLocation TEXT,
                distance REAL,
                duration INTEGER,
                status TEXT DEFAULT 'active'
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                message TEXT NOT NULL,
                severity TEXT DEFAULT 'info',
                timestamp TEXT NOT NULL,
                acknowledged INTEGER DEFAULT 0
            )`);
            
            log('info', 'Database tables are ready.');
        });
    };
    
    createTables();
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../project/dist/index.html'));
  });
}

// Health check endpoint for production monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: require('../package.json').version || '1.0.0'
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
    log('info', 'Shutting down gracefully...');
    if (db) {
        db.close((err) => {
            if (err) {
                log('error', 'Error closing database:', err.message);
            } else {
                log('info', 'Database connection closed.');
            }
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

process.on('SIGTERM', () => {
    log('info', 'Received SIGTERM, shutting down gracefully...');
    if (db) {
        db.close(() => {
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

// Start server
server.listen(PORT, () => {
    log('info', `🚀 Geo Guard server is running on http://localhost:${PORT}`);
    log('info', `Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Start vehicle simulation
    setInterval(simulateVehicleMovement, 2000);
    log('info', 'Vehicle simulation started.');
});
