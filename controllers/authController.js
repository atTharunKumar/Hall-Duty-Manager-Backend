// const db = require('../db');

// exports.googleAuth = (req, res) => {
//   const { email } = req.body;
//   if (!email) return res.status(400).json({ error: 'Email is required' });

//   const query = 'SELECT role FROM users WHERE email = ?';
//   db.query(query, [email], (err, results) => {
//     if (err) return res.status(500).json({ error: 'DB error' });
//     if (results.length === 0) return res.status(404).json({ error: 'User not found' });

//     const role = results[0].role;
//     res.json({ success: true, role });
//   });
// };


const db = require('../config/db');

exports.googleAuth = (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  const query = `SELECT role FROM user WHERE email = ?`;
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });

    const role = results[0].role;
    res.json({ success: true, role });
  });
};
