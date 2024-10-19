const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const port = 5000;

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: 'tharun.19', // Replace with your MySQL password
  database: 'hall_duty_manager'
});
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Staff Management Routes
app.get('/api/staff', (req, res) => {
  connection.query('SELECT * FROM staff', (err, results) => {
    if (err) {
      console.error('Error fetching staff data:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

app.post('/api/staff', (req, res) => {
  const { name, type } = req.body;
  connection.query('INSERT INTO staff (name, type) VALUES (?, ?)', [name, type], (err, results) => {
    if (err) {
      console.error('Error adding new staff:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json({ id: results.insertId, name, type });
  });
});

app.put('/api/staff/:id', (req, res) => {
  const { id } = req.params;
  const { name, type } = req.body;
  connection.query('UPDATE staff SET name = ?, type = ? WHERE id = ?', [name, type, id], (err) => {
    if (err) {
      console.error('Error updating staff:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json({ id, name, type });
  });
});

// Hall Management Routes
app.get('/api/halls', (req, res) => {
  connection.query('SELECT * FROM halls', (err, results) => {
    if (err) {
      console.error('Error fetching halls data:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

app.post('/api/halls', (req, res) => {
  const { name, capacity, ROW_S, COL_s } = req.body;
  console.log(req.body)
  connection.query('INSERT INTO halls (name, capacity) VALUES (?, ?)', [name, capacity], (err, results) => {
    if (err) {
      console.error('Error adding new hall:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    
  });
  connection.query('UPDATE halls SET ROW_S = ?, COL_s = ? WHERE name = ?', [ ROW_S, COL_s, name], (err) => {
    if (err) {
     console.err(err)
   
    }
   
    res.send({message:"ji"})
  });
});

app.put('/api/halls/:id', (req, res) => {
  const { id } = req.params;
  const { name, capacity, ROW_S, COL_s } = req.body;
  connection.query('UPDATE halls SET name = ?, capacity = ?, ROW_S = ?, COL_s = ? WHERE id = ?', [name, capacity, ROW_S, COL_s, id], (err) => {
    if (err) {
     console.err(err)
   
    }
   
    res.json({ id, name, capacity, ROW_S, COL_s });
  });
});


// Session Strength Management Routes
app.get('/api/session-strengths', (req, res) => {
  connection.query('SELECT * FROM session_strengths ORDER BY day', (err, results) => {
    if (err) {
      console.error('Error fetching session strengths:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

app.post('/api/session-strengths', (req, res) => {
  const { sessionStrengths } = req.body;

  // Begin transaction
  connection.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Delete existing session strengths
    connection.query('DELETE FROM session_strengths', (err) => {
      if (err) {
        console.error('Error deleting existing session strengths:', err);
        return connection.rollback(() => {
          res.status(500).send('Internal Server Error');
        });
      }

      // Insert new session strengths
      const values = sessionStrengths.map(({ day, exam1, exam2 }) => [
        day, exam1.name, exam1.strength, exam2.name, exam2.strength
      ]);

      connection.query(
        'INSERT INTO session_strengths (day, exam1_name, exam1_strength, exam2_name, exam2_strength) VALUES ?',
        [values],
        (err) => {
          if (err) {
            console.error('Error inserting new session strengths:', err);
            return connection.rollback(() => {
              res.status(500).send('Internal Server Error');
            });
          }

          // Commit transaction
          connection.commit((err) => {
            if (err) {
              console.error('Error committing transaction:', err);
              return connection.rollback(() => {
                res.status(500).send('Internal Server Error');
              });
            }
            res.json({ message: 'Session strengths updated successfully!' });
          });
        }
      );
    });
  });
});

// Fetch Students Route
app.get('/api/students', (req, res) => {
  connection.query('SELECT * FROM students', (err, results) => {
    if (err) {
      console.error('Error fetching student data:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

// Handle other routes
app.get('/api/reports', (req, res) => {
  res.json({ message: 'Reports feature is under development.' });
});

app.get('/api/settings', (req, res) => {
  res.json({ message: 'Settings feature is under development.' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
