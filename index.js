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



let storedData = []; // Temporary storage for uploaded data

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
  const { name, type, designation } = req.body;
  connection.query('INSERT INTO staff (name, type, designation) VALUES (?, ?, ?)', [name, type, designation], (err, results) => {
    if (err) {
      console.error('Error adding new staff:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json({ id: results.insertId, name, type , designation});
  });
});



app.put('/api/staff/:id', (req, res) => {
  const { id } = req.params;
  const { name, type, designation} = req.body;
  console.log(req.body)
  const query = 'UPDATE staff SET name = ?, type = ?,  designation = ? WHERE id = ?';
  connection.query(query, [name, type, designation, id], (err) => {
    if (err) {
      console.error('Error updating staff:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json({ id, name, type, designation});
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

// Endpoint to handle Excel data upload
app.post('/api/upload-excel', (req, res) => {
  const excelData = req.body;
  if (!excelData || !Array.isArray(excelData)) {
      return res.status(400).json({ error: 'Invalid data format' });
  }

  // Store the data
  storedData = [...excelData];
  console.log('Data received and stored:', storedData);
const values = storedData.map(item => [
  item.Date,
  item.Session,
  item['Course Code'], // Use square brackets for keys with spaces
  item.Department,
  item['Student Name'], // Use square brackets for keys with spaces
  item['Register Number'] // Use square brackets for keys with spaces
]);

console.log(values);
connection.query(
  `INSERT INTO merged_table (date, session, course_code, department, student_name, register_number) VALUES ?`,
  [values],
  (err) => {
    if (err) {
      console.error('Error inserting data into merged_table:', err);
      // Send response only if there was an error, and prevent further responses
      if (!res.headersSent) {
        res.status(500).send('Internal Server Error');
      }
      return;
    }

    // Send success response only once
    if (!res.headersSent) {
      res.json({ message: 'Data stored successfully in merged_table!' });
    }
  }
);



  // connection.query(
  //   `INSERT INTO merged_table (date, session, course_code, department, student_name, register_number) VALUES ?`,
  //   [values],
  //   (err) => {
  //     if (err) {
  //       console.error('Error inserting data into merged_table:', err);
  //       res.status(500).send('Internal Server Error');
  //       return;
  //     }
  //     res.json({ message: 'Data stored successfully in merged_table!' });
  //   }
  // );
  res.status(200).json({ message: 'Excel data uploaded and stored successfully' });
});

// Endpoint to retrieve stored data (optional)
app.get('/api/retrieve-data', (req, res) => {
  res.status(200).json(storedData);
});

// Endpoint to store data in the existing 'merged_table'




