const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const multer = require('multer');
const XLSX = require('xlsx');
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
// Increase payload limit to 50mb for JSON and URL-encoded data
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Multer setup for handling file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---------- Staff Management Routes ----------
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
  const { name, type, designation } = req.body;
  connection.query('INSERT INTO staff (name, type, designation) VALUES (?, ?, ?)', [name, type, designation], (err, results) => {
    if (err) {
      console.error('Error adding new staff:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json({ id: results.insertId, name, type, designation });
  });
});

app.put('/api/staff/:id', (req, res) => {
  const { id } = req.params;
  const { name, type, designation } = req.body;
  const query = 'UPDATE staff SET name = ?, type = ?, designation = ? WHERE id = ?';
  connection.query(query, [name, type, designation, id], (err) => {
    if (err) {
      console.error('Error updating staff:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json({ id, name, type, designation });
  });
});

// ---------- Hall Management Routes ----------
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
  connection.query('INSERT INTO halls (name, capacity) VALUES (?, ?)', [name, capacity], (err, results) => {
    if (err) {
      console.error('Error adding new hall:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    // Update additional fields after insertion
    connection.query('UPDATE halls SET ROW_S = ?, COL_s = ? WHERE name = ?', [ROW_S, COL_s, name], (err) => {
      if (err) {
        console.error('Error updating hall additional fields:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.send({ message: "Hall added successfully" });
    });
  });
});

app.put('/api/halls/:id', (req, res) => {
  const { id } = req.params;
  const { name, capacity, ROW_S, COL_s } = req.body;
  connection.query('UPDATE halls SET name = ?, capacity = ?, ROW_S = ?, COL_s = ? WHERE id = ?', [name, capacity, ROW_S, COL_s, id], (err) => {
    if (err) {
      console.error('Error updating hall:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json({ id, name, capacity, ROW_S, COL_s });
  });
});

// New endpoint to handle XLSX/CSV uploads and replace halls data
app.post('/api/halls/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }
  try {
    // Parse the file from the file buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // Use the first sheet
    const worksheet = workbook.Sheets[sheetName];
    // Convert the worksheet to JSON; each row becomes an object
    const hallsData = XLSX.utils.sheet_to_json(worksheet);
    
    // Begin transaction to replace hall data
    connection.beginTransaction(err => {
      if (err) {
        console.error('Transaction error:', err);
        return res.status(500).send('Internal Server Error');
      }
      // Delete existing hall records
      connection.query('DELETE FROM halls', (err) => {
        if (err) {
          console.error('Error deleting existing halls:', err);
          return connection.rollback(() => res.status(500).send('Internal Server Error'));
        }
        // Map each hall record to an array for bulk insert.
        // Assuming each hall has: name, ROW_S, COL_s. Calculate capacity = ROW_S * COL_s.
        const values = hallsData.map(item => {
          const rows = parseInt(item.ROW_S, 10);
          const columns = parseInt(item.COL_s, 10);
          const capacity = rows * columns;
          return [item.name, capacity, rows, columns];
        });
        // Insert new hall records. Adjust the query as per your table schema.
        connection.query(
          `INSERT INTO halls (name, capacity, ROW_S, COL_s) VALUES ?`,
          [values],
          (err) => {
            if (err) {
              console.error('Error inserting new hall data:', err);
              return connection.rollback(() => res.status(500).send('Internal Server Error'));
            }
            connection.commit(err => {
              if (err) {
                console.error('Commit error:', err);
                return connection.rollback(() => res.status(500).send('Internal Server Error'));
              }
              res.json({ message: 'Hall data replaced successfully from XLSX file!' });
            });
          }
        );
      });
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// ---------- Session Strength Management Routes ----------
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
  connection.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).send('Internal Server Error');
    }
    connection.query('DELETE FROM session_strengths', (err) => {
      if (err) {
        console.error('Error deleting existing session strengths:', err);
        return connection.rollback(() => res.status(500).send('Internal Server Error'));
      }
      const values = sessionStrengths.map(({ day, exam1, exam2 }) => [
        day, exam1.name, exam1.strength, exam2.name, exam2.strength
      ]);
      connection.query(
        'INSERT INTO session_strengths (day, exam1_name, exam1_strength, exam2_name, exam2_strength) VALUES ?',
        [values],
        (err) => {
          if (err) {
            console.error('Error inserting new session strengths:', err);
            return connection.rollback(() => res.status(500).send('Internal Server Error'));
          }
          connection.commit((err) => {
            if (err) {
              console.error('Error committing transaction:', err);
              return connection.rollback(() => res.status(500).send('Internal Server Error'));
            }
            res.json({ message: 'Session strengths updated successfully!' });
          });
        }
      );
    });
  });
});

// ---------- Students Management Routes ----------
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

app.post('/api/students/upload', (req, res) => {
  const studentsData = req.body;
  if (!studentsData || !Array.isArray(studentsData)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }
  connection.beginTransaction(err => {
    if (err) {
      console.error('Transaction error:', err);
      return res.status(500).send('Internal Server Error');
    }
    connection.query('DELETE FROM students', (err) => {
      if (err) {
        console.error('Error deleting existing student data:', err);
        return connection.rollback(() => res.status(500).send('Internal Server Error'));
      }
      const values = studentsData.map(item => [
        item.registration_number,
        item.name,
        item.department,
        item.subject_code,
        item.date,
        item.session
      ]);
      connection.query(
        `INSERT INTO students (registration_number, name, department, subject_code, date, session) VALUES ?`,
        [values],
        (err) => {
          if (err) {
            console.error('Error inserting new student data:', err);
            return connection.rollback(() => res.status(500).send('Internal Server Error'));
          }
          connection.commit(err => {
            if (err) {
              console.error('Commit error:', err);
              return connection.rollback(() => res.status(500).send('Internal Server Error'));
            }
            res.json({ message: 'Student data replaced successfully!' });
          });
        }
      );
    });
  });
});

app.post('/api/students/upload-xlsx', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const studentsData = XLSX.utils.sheet_to_json(worksheet);
    
    connection.beginTransaction(err => {
      if (err) {
        console.error('Transaction error:', err);
        return res.status(500).send('Internal Server Error');
      }
      connection.query('DELETE FROM students', (err) => {
        if (err) {
          console.error('Error deleting existing student data:', err);
          return connection.rollback(() => res.status(500).send('Internal Server Error'));
        }
        const values = studentsData.map(item => [
          item.registration_number,
          item.name,
          item.department,
          item.subject_code,
          item.date,
          item.session
        ]);
        connection.query(
          `INSERT INTO students (registration_number, name, department, subject_code, date, session) VALUES ?`,
          [values],
          (err) => {
            if (err) {
              console.error('Error inserting new student data:', err);
              return connection.rollback(() => res.status(500).send('Internal Server Error'));
            }
            connection.commit(err => {
              if (err) {
                console.error('Commit error:', err);
                return connection.rollback(() => res.status(500).send('Internal Server Error'));
              }
              res.json({ message: 'Student data replaced successfully from XLSX file!' });
            });
          }
        );
      });
    });
  } catch (error) {
    console.error('Error processing XLSX file:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// ---------- Other Routes ----------
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
