const db = require('../config/db');

exports.getAllBookings = (req, res) => {
  const query = `
    SELECT 
      b.id,
      b.userName,
      b.userEmail,
      b.bookedAt,
      s.id AS slotId,
      s.courseDetails,
      s.date_from,
      s.start_time,
      s.end_time,
      s.venue
    FROM bookings b
    JOIN slots s ON b.slotId = s.id
    ORDER BY b.bookedAt DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching bookings:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    
    const bookings = results.map(row => ({
      id: row.id,
      user: { name: row.userName, email: row.userEmail },
      slot: {
        id: row.slotId,
        courseDetails: row.courseDetails,
        date_from: row.date_from,
        start_time: row.start_time,
        end_time: row.end_time,
        venue: row.venue
      },
      bookedAt: row.bookedAt
    }));
    
    res.json(bookings);
  });
};

exports.createBooking = (req, res) => {
  const { slotId, user } = req.body;
  
  if (!slotId || !user || !user.name || !user.email) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  db.query('SELECT * FROM slots WHERE id = ?', [slotId], (err, results) => {
    if (err) {
      console.error('Error fetching slot:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Slot not found" });
    }
    
    const slot = results[0];
    
    if (slot.available_slots <= 0) {
      return res.status(400).json({ error: "No available slots" });
    }
    
    db.beginTransaction(err => {
      if (err) {
        console.error("Transaction error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      
      db.query('UPDATE slots SET available_slots = available_slots - 1 WHERE id = ?', [slotId], (err) => {
        if (err) {
          console.error("Error updating slot:", err);
          return db.rollback(() => res.status(500).json({ error: "Internal Server Error" }));
        }
        
        const bookedAt = new Date();
        
        db.query(
          'INSERT INTO bookings (slotId, userName, userEmail, bookedAt) VALUES (?, ?, ?, ?)',
          [slotId, user.name, user.email, bookedAt],
          (err, insertResults) => {
            if (err) {
              console.error("Error inserting booking:", err);
              return db.rollback(() => res.status(500).json({ error: "Internal Server Error" }));
            }
            
            db.commit(err => {
              if (err) {
                console.error("Commit error:", err);
                return db.rollback(() => res.status(500).json({ error: "Internal Server Error" }));
              }
              
              res.json({
                bookingId: insertResults.insertId,
                slotId,
                user,
                bookedAt,
                updatedSlot: { ...slot, available_slots: slot.available_slots - 1 }
              });
            });
          }
        );
      });
    });
  });
};