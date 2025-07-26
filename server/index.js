const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});
const port = 3001;

// Add error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// --- Vehicle & Trip State ---
let activeTripId = null;
const vehicleStatus = {
  vehicleId: 'vehicle-1-demo',
  location: { latitude: 12.917936, longitude: 77.592258, speed: 0, heading: 0, timestamp: new Date() }, // Bangalore coordinates
  ignitionOn: false,
  isMoving: false,
  batteryLevel: 85,
  engineLocked: false,
  gsmSignal: 92,
  gpsSignal: 98,
  lastUpdate: new Date(),
};

// --- THIS IS THE VEHICLE SIMULATION LOGIC THAT WAS MISSING ---
function updateVehicleLocation() {
  const isMoving = vehicleStatus.ignitionOn;
  if (isMoving) {
    // Simulate slight movement
    vehicleStatus.location.latitude += (Math.random() - 0.5) * 0.0005;
    vehicleStatus.location.longitude += (Math.random() - 0.5) * 0.0005;
  }
  
  // Update other stats
  vehicleStatus.location.speed = isMoving ? Math.round(Math.random() * 60 + 20) : 0;
  vehicleStatus.isMoving = isMoving;
  vehicleStatus.lastUpdate = new Date();
  
  // Broadcast the new status to all connected clients
  io.emit('vehicleUpdate', vehicleStatus);
}
// -------------------------------------------------------------

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO Connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.emit('vehicleUpdate', vehicleStatus); // Send current status immediately
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Server running', 
    timestamp: new Date().toISOString(),
    vehicleStatus: vehicleStatus 
  });
});

// API Routes
app.post('/toggle-ignition', (req, res) => {
    vehicleStatus.ignitionOn = !vehicleStatus.ignitionOn;
    const now = new Date().toISOString();

    if (vehicleStatus.ignitionOn) { // Start Trip
        activeTripId = `trip-${Date.now()}`;
        const sql = `INSERT INTO trips (id, vehicleId, startTime, startLat, startLon, status) VALUES (?, ?, ?, ?, ?, ?)`;
        db.run(sql, [activeTripId, vehicleStatus.vehicleId, now, vehicleStatus.location.latitude, vehicleStatus.location.longitude, 'active'], (err) => {
            if (err) console.error("Error starting trip:", err.message);
            else console.log("Trip started:", activeTripId);
        });
    } else { // End Trip
        if (activeTripId) {
            const sql = `UPDATE trips SET endTime = ?, endLat = ?, endLon = ?, status = ? WHERE id = ?`;
            db.run(sql, [now, vehicleStatus.location.latitude, vehicleStatus.location.longitude, 'completed', activeTripId], (err) => {
                if (err) console.error("Error ending trip:", err.message);
                else console.log("Trip ended:", activeTripId);
            });
            activeTripId = null;
        }
    }
    io.emit('vehicleUpdate', vehicleStatus);
    res.json({ message: `Ignition is now ${vehicleStatus.ignitionOn ? 'ON' : 'OFF'}` });
});

app.get('/trips', (req, res) => {
    db.all(`SELECT * FROM trips WHERE status = 'completed' ORDER BY startTime DESC LIMIT 20`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Format the trips data for better display
        const formattedTrips = rows.map(trip => ({
            id: trip.id,
            vehicleId: trip.vehicleId,
            startTime: trip.startTime,
            endTime: trip.endTime,
            startLocation: {
                latitude: trip.startLat,
                longitude: trip.startLon,
                timestamp: new Date(trip.startTime)
            },
            endLocation: {
                latitude: trip.endLat,
                longitude: trip.endLon,
                timestamp: new Date(trip.endTime)
            },
            status: trip.status,
            // Calculate duration in minutes
            duration: trip.endTime ? Math.round((new Date(trip.endTime) - new Date(trip.startTime)) / (1000 * 60)) : 0,
            // Calculate distance (rough estimate)
            distance: trip.startLat && trip.endLat ? 
                Math.round(Math.sqrt(
                    Math.pow(trip.endLat - trip.startLat, 2) + 
                    Math.pow(trip.endLon - trip.startLon, 2)
                ) * 111000) / 1000 : 0 // Convert to km
        }));
        
        console.log(`Returning ${formattedTrips.length} trips`);
        res.json(formattedTrips);
    });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const userId = `user-${Date.now()}`;
    const sql = `INSERT INTO users (id, username, password) VALUES (?, ?, ?)`;
    
    db.run(sql, [userId, username, password], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            console.error('Registration error:', err.message);
            return res.status(500).json({ error: 'Registration failed' });
        }
        
        console.log('User registered:', username);
        res.json({ message: 'Registration successful' });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
    
    db.get(sql, [username, password], (err, row) => {
        if (err) {
            console.error('Login error:', err.message);
            return res.status(500).json({ error: 'Login failed' });
        }
        
        if (!row) {
            return res.status(401).json({ error: 'Invalid username or password' });
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

// Update user profile endpoint
app.put('/user/:id', (req, res) => {
    const { id } = req.params;
    const { email, phone } = req.body;
    
    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    
    const sql = `UPDATE users SET email = ?, phone = ? WHERE id = ?`;
    
    db.run(sql, [email, phone, id], function(err) {
        if (err) {
            console.error('Profile update error:', err.message);
            return res.status(500).json({ error: 'Profile update failed' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Return updated user info
        db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
            if (err) {
                console.error('Error fetching updated user:', err.message);
                return res.status(500).json({ error: 'Failed to fetch updated user' });
            }
            
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
        });
    });
});


// --- Database and Server Initialization ---
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error("Fatal DB Connection Error:", err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
    
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT, email TEXT, phone TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS trips (id TEXT PRIMARY KEY, vehicleId TEXT, startTime TEXT, endTime TEXT, startLat REAL, startLon REAL, endLat REAL, endLon REAL, status TEXT);
    `, (err) => {
        if (err) {
            console.error("Error creating tables:", err.message);
            process.exit(1);
        }
        console.log("Database tables are ready.");

        // Insert default users if they don't exist
        const defaultUsers = [
            { id: 'user-admin', username: 'admin', password: 'admin123' },
            { id: 'user-demo', username: 'demo', password: 'demo123' }
        ];

        defaultUsers.forEach(user => {
            db.run(`INSERT OR IGNORE INTO users (id, username, password) VALUES (?, ?, ?)`, 
                [user.id, user.username, user.password], (err) => {
                    if (err) {
                        console.error(`Error creating default user ${user.username}:`, err.message);
                    } else {
                        console.log(`Default user '${user.username}' ready`);
                    }
                });
        });

        // Start server and simulation only after DB is ready
        server.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
            // Start the simulation using setInterval
            setInterval(updateVehicleLocation, 3000);
            console.log("Vehicle simulation started.");
        });
    });
});