// const db = require('../db');

// exports.getSlots = (req, res) => {
//   db.query('SELECT * FROM slots ORDER BY date_from', (err, results) => {
//     if (err) return res.status(500).send('Error fetching slots');
//     res.json(results);
//   });
// };

// exports.addSlot = (req, res) => {
//   const { courseDetails, date_from, start_time, end_time, venue, total_slots } = req.body;
//   if (!courseDetails || !date_from || !start_time || !end_time || !venue || !total_slots) {
//     return res.status(400).send('Missing required fields');
//   }
//   const query = 'INSERT INTO slots (courseDetails, date_from, start_time, end_time, venue, total_slots, available_slots) VALUES (?, ?, ?, ?, ?, ?, ?)';
//   db.query(query, [courseDetails, date_from, start_time, end_time, venue, total_slots, total_slots], (err) => {
//     if (err) return res.status(500).send('Error adding slot');
//     res.send({ message: 'Slot added' });
//   });
// };

const db = require('../config/db');

exports.getAllSlots = (req, res) => {
  db.query('SELECT * FROM slots ORDER BY date_from', (err, results) => {
    if (err) {
      console.error('Error fetching slots:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.json(results);
  });
};

exports.addSlot = (req, res) => {
  const { courseDetails, date_from, start_time, end_time, venue, total_slots } = req.body;
  
  if (!courseDetails || !date_from || !start_time || !end_time || !venue || !total_slots) {
    return res.status(400).send('Missing required fields');
  }
  
  const query = 'INSERT INTO slots (courseDetails, date_from, start_time, end_time, venue, total_slots, available_slots) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [courseDetails, date_from, start_time, end_time, venue, Number(total_slots), Number(total_slots)];
  
  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error inserting slot:', err);
      return res.status(500).send('Internal Server Error');
    }
    
    res.json({
      id: results.insertId,
      courseDetails,
      date_from,
      start_time,
      end_time,
      venue,
      total_slots: Number(total_slots),
      available_slots: Number(total_slots)
    });
  });
};

