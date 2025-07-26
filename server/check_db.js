const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    
    console.log('📊 DATABASE CONTENT ANALYSIS:');
    console.log('=' * 50);
    
    // Check tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
            console.error('Error getting tables:', err.message);
            return;
        }
        
        console.log('\n🗂️  TABLES FOUND:');
        tables.forEach(table => {
            console.log(`- ${table.name}`);
        });
        
        // Check users table
        db.all("SELECT * FROM users", (err, users) => {
            if (err) {
                console.error('Error getting users:', err.message);
            } else {
                console.log(`\n👥 USERS TABLE (${users.length} records):`);
                users.forEach(user => {
                    console.log(`- ID: ${user.id}, Username: ${user.username}, Password: ${user.password}, Email: ${user.email || 'N/A'}, Phone: ${user.phone || 'N/A'}`);
                });
            }
            
            // Check trips
            db.all("SELECT * FROM trips", (err, trips) => {
                if (err) {
                    console.error('Error getting trips:', err.message);
                } else {
                    console.log(`\n🚗 TRIPS TABLE (${trips.length} records):`);
                    trips.forEach(trip => {
                        console.log(`- ID: ${trip.id}, Start: ${trip.startTime}, Status: ${trip.status}`);
                    });
                }
                
                // Check alerts
                db.all("SELECT * FROM alerts", (err, alerts) => {
                    if (err) {
                        console.error('Error getting alerts:', err.message);
                    } else {
                        console.log(`\n🚨 ALERTS TABLE (${alerts.length} records):`);
                        alerts.forEach(alert => {
                            console.log(`- ID: ${alert.id}, Type: ${alert.type}, Message: ${alert.message}`);
                        });
                    }
                    
                    console.log('\n⚠️  SECURITY RISK: This data is visible to ANYONE who downloads your GitHub repo!');
                    db.close();
                });
            });
        });
    });
});
