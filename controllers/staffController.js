// const db = require('../db');

// exports.getStaff = (req, res) => {
//   db.query('SELECT * FROM staff', (err, results) => {
//     if (err) return res.status(500).send('Error fetching staff');
//     res.json(results);
//   });
// };

// exports.addStaff = (req, res) => {
//   const { name, type, designation } = req.body;
//   db.query('INSERT INTO staff (name, type, designation) VALUES (?, ?, ?)', [name, type, designation], (err, result) => {
//     if (err) return res.status(500).send('Error adding staff');
//     res.json({ id: result.insertId, name, type, designation });
//   });
// };

// exports.updateStaff = (req, res) => {
//   const { id } = req.params;
//   const { name, type, designation } = req.body;
//   db.query('UPDATE staff SET name = ?, type = ?, designation = ? WHERE id = ?', [name, type, designation, id], (err) => {
//     if (err) return res.status(500).send('Error updating staff');
//     res.json({ id, name, type, designation });
//   });
// };

const db = require('../config/db');

exports.getAllStaff = (req, res) => {
  db.query('SELECT * FROM staff', (err, results) => {
    if (err) {
      console.error('Error fetching staff data:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.json(results);
  });
};

exports.addStaff = (req, res) => {
  const { name, type, designation } = req.body;
  db.query('INSERT INTO staff (name, type, designation) VALUES (?, ?, ?)', 
    [name, type, designation], 
    (err, results) => {
      if (err) {
        console.error('Error adding new staff:', err);
        return res.status(500).send('Internal Server Error');
      }
      res.json({ id: results.insertId, name, type, designation });
    }
  );
};

exports.updateStaff = (req, res) => {
  const { id } = req.params;
  const { name, type, designation } = req.body;
  const query = 'UPDATE staff SET name = ?, type = ?, designation = ? WHERE id = ?';
  
  db.query(query, [name, type, designation, id], (err) => {
    if (err) {
      console.error('Error updating staff:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.json({ id, name, type, designation });
  });
};