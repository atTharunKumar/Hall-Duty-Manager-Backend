// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const mysql = require('mysql2');
// const multer = require('multer');
// const XLSX = require('xlsx');
// const session = require('express-session');
// // const { OAuth2Client } = require('google-auth-library');

// const app = express();
// const port = 5000;

// // MySQL connection
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root', // Replace with your MySQL username
//   password: 'tharun.19', // Replace with your MySQL password
//   database: 'hall_duty_manager'
// });
// connection.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL:', err);
//     return;
//   }
//   console.log('Connected to MySQL');
// });

// // app.use((req, res, next) => {
// //   res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
// //   next();
// // });


// // Google OAuth client setup (use your actual client ID)
// // const CLIENT_ID = '361374319106-batvm6m2ctt8mbse8cjf71lsgdusl06f.apps.googleusercontent.com';
// // const googleClient = new OAuth2Client(CLIENT_ID);

// // Middleware
// app.use(cors({
//   origin: 'http://localhost:3000', // Adjust to your front-end URL
//   credentials: true,
// }));
// app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// // Session middleware
// app.use(session({
//   secret: 'your-secret-key', // Replace with a strong secret
//   resave: false,
//   saveUninitialized: false,
// }));

// // Multer setup for file uploads (memory storage)
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // /* ---------- Google OAuth Endpoints ---------- */

// // // POST /auth/google
// // app.post('/auth/google', async (req, res) => {
// //   const { token } = req.body;
// //   if (!token) {
// //     return res.status(400).json({ error: 'Token is required' });
// //   }
// //   try {
// //     // Verify token using Google OAuth2 client
// //     const ticket = await googleClient.verifyIdToken({
// //       idToken: token,
// //       audience: CLIENT_ID,
// //     });
// //     const payload = ticket.getPayload();
// //     const { email, name, picture } = payload;

// //     // Determine user role (example: if email includes "admin" then role is admin)
// //     let role = 'faculty'; // default role
// //     if (email.includes('admin')) {
// //       role = 'admin';
// //     }
// //     // Alternatively, you can query your database to determine the role

// //     // Save user details in session
// //     req.session.user = { email, name, picture, role };

// //     res.json({ user: req.session.user, role });
// //   } catch (error) {
// //     console.error("Error verifying Google token:", error);
// //     res.status(401).json({ error: 'Invalid token' });
// //   }
// // });

// // // GET /auth/user - returns current logged-in user
// // app.get('/auth/user', (req, res) => {
// //   if (req.session.user) {
// //     res.json(req.session.user);
// //   } else {
// //     res.status(401).json({ error: 'Not authenticated' });
// //   }
// // });

// // // GET /auth/logout - logs out the user
// // app.get('/auth/logout', (req, res) => {
// //   req.session.destroy((err) => {
// //     if (err) {
// //       console.error('Logout error:', err);
// //       return res.status(500).json({ error: 'Logout failed' });
// //     }
// //     res.json({ message: 'Logged out successfully' });
// //   });
// // });

// /* ---------- Staff Management Routes ---------- */
// app.get('/api/staff', (req, res) => {
//   connection.query('SELECT * FROM staff', (err, results) => {
//     if (err) {
//       console.error('Error fetching staff data:', err);
//       res.status(500).send('Internal Server Error');
//       return;
//     }
//     res.json(results);
//   });
// });

// app.post('/api/staff', (req, res) => {
//   const { name, type, designation } = req.body;
//   connection.query('INSERT INTO staff (name, type, designation) VALUES (?, ?, ?)', [name, type, designation], (err, results) => {
//     if (err) {
//       console.error('Error adding new staff:', err);
//       res.status(500).send('Internal Server Error');
//       return;
//     }
//     res.json({ id: results.insertId, name, type, designation });
//   });
// });

// app.put('/api/staff/:id', (req, res) => {
//   const { id } = req.params;
//   const { name, type, designation } = req.body;
//   const query = 'UPDATE staff SET name = ?, type = ?, designation = ? WHERE id = ?';
//   connection.query(query, [name, type, designation, id], (err) => {
//     if (err) {
//       console.error('Error updating staff:', err);
//       res.status(500).send('Internal Server Error');
//       return;
//     }
//     res.json({ id, name, type, designation });
//   });
// });

// /* ---------- Hall Management Routes ---------- */
// app.get('/api/halls', (req, res) => {
//   connection.query('SELECT * FROM halls', (err, results) => {
//     if (err) {
//       console.error('Error fetching halls data:', err);
//       res.status(500).send('Internal Server Error');
//       return;
//     }
//     res.json(results);
//   });
// });

// app.post('/api/halls', (req, res) => {
//   const { name, capacity, ROW_S, COL_s } = req.body;
//   connection.query('INSERT INTO halls (name, capacity) VALUES (?, ?)', [name, capacity], (err, results) => {
//     if (err) {
//       console.error('Error adding new hall:', err);
//       res.status(500).send('Internal Server Error');
//       return;
//     }
//     // Update additional fields after insertion
//     connection.query('UPDATE halls SET ROW_S = ?, COL_s = ? WHERE name = ?', [ROW_S, COL_s, name], (err) => {
//       if (err) {
//         console.error('Error updating hall additional fields:', err);
//         res.status(500).send('Internal Server Error');
//         return;
//       }
//       res.send({ message: "Hall added successfully" });
//     });
//   });
// });

// app.put('/api/halls/:id', (req, res) => {
//   const { id } = req.params;
//   const { name, capacity, ROW_S, COL_s } = req.body;
//   connection.query('UPDATE halls SET name = ?, capacity = ?, ROW_S = ?, COL_s = ? WHERE id = ?', [name, capacity, ROW_S, COL_s, id], (err) => {
//     if (err) {
//       console.error('Error updating hall:', err);
//       res.status(500).send('Internal Server Error');
//       return;
//     }
//     res.json({ id, name, capacity, ROW_S, COL_s });
//   });
// });

// // Endpoint for XLSX/CSV uploads to replace halls data
// app.post('/api/halls/upload', upload.single('file'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'No file provided' });
//   }
//   try {
//     const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const hallsData = XLSX.utils.sheet_to_json(worksheet);
    
//     connection.beginTransaction(err => {
//       if (err) {
//         console.error('Transaction error:', err);
//         return res.status(500).send('Internal Server Error');
//       }
//       connection.query('DELETE FROM halls', (err) => {
//         if (err) {
//           console.error('Error deleting existing halls:', err);
//           return connection.rollback(() => res.status(500).send('Internal Server Error'));
//         }
//         const values = hallsData.map(item => {
//           const rows = parseInt(item.ROW_S, 10);
//           const columns = parseInt(item.COL_s, 10);
//           const capacity = rows * columns;
//           return [item.name, capacity, rows, columns];
//         });
//         connection.query(
//           `INSERT INTO halls (name, capacity, ROW_S, COL_s) VALUES ?`,
//           [values],
//           (err) => {
//             if (err) {
//               console.error('Error inserting new hall data:', err);
//               return connection.rollback(() => res.status(500).send('Internal Server Error'));
//             }
//             connection.commit(err => {
//               if (err) {
//                 console.error('Commit error:', err);
//                 return connection.rollback(() => res.status(500).send('Internal Server Error'));
//               }
//               res.json({ message: 'Hall data replaced successfully from XLSX file!' });
//             });
//           }
//         );
//       });
//     });
//   } catch (error) {
//     console.error('Error processing file:', error);
//     res.status(500).json({ error: 'Failed to process file' });
//   }
// });

// /* ---------- Slot Management Routes ---------- */

// app.get('/api/slots', (req, res) => {
//   connection.query('SELECT * FROM slots ORDER BY date_from', (err, results) => {
//     if (err) {
//       console.error('Error fetching slots:', err);
//       return res.status(500).send('Internal Server Error');
//     }
//     res.json(results);
//   });
// });

// app.post('/api/slots', (req, res) => {
//   const { courseDetails, date_from, start_time, end_time, venue, total_slots } = req.body;
//   if (!courseDetails || !date_from || !start_time || !end_time || !venue || !total_slots) {
//     return res.status(400).send('Missing required fields');
//   }
//   const query = 'INSERT INTO slots (courseDetails, date_from, start_time, end_time, venue, total_slots, available_slots) VALUES (?, ?, ?, ?, ?, ?, ?)';
//   const values = [courseDetails, date_from, start_time, end_time, venue, Number(total_slots), Number(total_slots)];
//   connection.query(query, values, (err, results) => {
//     if (err) {
//       console.error('Error inserting slot:', err);
//       return res.status(500).send('Internal Server Error');
//     }
//     res.json({
//       id: results.insertId,
//       courseDetails,
//       date_from,
//       start_time,
//       end_time,
//       venue,
//       total_slots: Number(total_slots),
//       available_slots: Number(total_slots)
//     });
//   });
// });

// /* ---------- Booking Routes ---------- */

// app.post('/api/bookings', (req, res) => {
//   const { slotId, user } = req.body;
//   if (!slotId || !user || !user.name || !user.email) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }
//   connection.query('SELECT * FROM slots WHERE id = ?', [slotId], (err, results) => {
//     if (err) {
//       console.error('Error fetching slot:', err);
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }
//     if (results.length === 0) {
//       return res.status(404).json({ error: "Slot not found" });
//     }
//     const slot = results[0];
//     if (slot.available_slots <= 0) {
//       return res.status(400).json({ error: "No available slots" });
//     }
//     connection.beginTransaction(err => {
//       if (err) {
//         console.error("Transaction error:", err);
//         return res.status(500).json({ error: "Internal Server Error" });
//       }
//       connection.query('UPDATE slots SET available_slots = available_slots - 1 WHERE id = ?', [slotId], (err) => {
//         if (err) {
//           console.error("Error updating slot:", err);
//           return connection.rollback(() => res.status(500).json({ error: "Internal Server Error" }));
//         }
//         const bookedAt = new Date();
//         connection.query(
//           'INSERT INTO bookings (slotId, userName, userEmail, bookedAt) VALUES (?, ?, ?, ?)',
//           [slotId, user.name, user.email, bookedAt],
//           (err, insertResults) => {
//             if (err) {
//               console.error("Error inserting booking:", err);
//               return connection.rollback(() => res.status(500).json({ error: "Internal Server Error" }));
//             }
//             connection.commit(err => {
//               if (err) {
//                 console.error("Commit error:", err);
//                 return connection.rollback(() => res.status(500).json({ error: "Internal Server Error" }));
//               }
//               res.json({
//                 bookingId: insertResults.insertId,
//                 slotId,
//                 user,
//                 bookedAt,
//                 updatedSlot: { ...slot, available_slots: slot.available_slots - 1 }
//               });
//             });
//           }
//         );
//       });
//     });
//   });
// });

// app.get('/api/bookings', (req, res) => {
//   const query = `
//     SELECT 
//       b.id,
//       b.userName,
//       b.userEmail,
//       b.bookedAt,
//       s.id AS slotId,
//       s.courseDetails,
//       s.date_from,
//       s.start_time,
//       s.end_time,
//       s.venue
//     FROM bookings b
//     JOIN slots s ON b.slotId = s.id
//     ORDER BY b.bookedAt DESC
//   `;
//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching bookings:", err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
//     const bookings = results.map(row => ({
//       id: row.id,
//       user: { name: row.userName, email: row.userEmail },
//       slot: {
//         id: row.slotId,
//         courseDetails: row.courseDetails,
//         date_from: row.date_from,
//         start_time: row.start_time,
//         end_time: row.end_time,
//         venue: row.venue
//       },
//       bookedAt: row.bookedAt
//     }));
//     res.json(bookings);
//   });
// });

// /* ---------- Session Strength Management Routes ---------- */
// app.get('/api/session-strengths', (req, res) => {
//   connection.query('SELECT * FROM session_strengths ORDER BY day', (err, results) => {
//     if (err) {
//       console.error('Error fetching session strengths:', err);
//       res.status(500).send('Internal Server Error');
//       return;
//     }
//     res.json(results);
//   });
// });

// app.post('/api/session-strengths', (req, res) => {
//   const { sessionStrengths } = req.body;
//   connection.beginTransaction((err) => {
//     if (err) {
//       console.error('Error starting transaction:', err);
//       return res.status(500).send('Internal Server Error');
//     }
//     connection.query('DELETE FROM session_strengths', (err) => {
//       if (err) {
//         console.error('Error deleting existing session strengths:', err);
//         return connection.rollback(() => res.status(500).send('Internal Server Error'));
//       }
//       const values = sessionStrengths.map(({ day, exam1, exam2 }) => [
//         day, exam1.name, exam1.strength, exam2.name, exam2.strength
//       ]);
//       connection.query(
//         'INSERT INTO session_strengths (day, exam1_name, exam1_strength, exam2_name, exam2_strength) VALUES ?',
//         [values],
//         (err) => {
//           if (err) {
//             console.error('Error inserting new session strengths:', err);
//             return connection.rollback(() => res.status(500).send('Internal Server Error'));
//           }
//           connection.commit((err) => {
//             if (err) {
//               console.error('Error committing transaction:', err);
//               return connection.rollback(() => res.status(500).send('Internal Server Error'));
//             }
//             res.json({ message: 'Session strengths updated successfully!' });
//           });
//         }
//       );
//     });
//   });
// });

// /* ---------- Students Management Routes ---------- */
// app.get('/api/students', (req, res) => {
//   connection.query('SELECT * FROM students', (err, results) => {
//     if (err) {
//       console.error('Error fetching student data:', err);
//       res.status(500).send('Internal Server Error');
//       return;
//     }
//     res.json(results);
//   });
// });

// app.post('/api/students/upload', (req, res) => {
//   const studentsData = req.body;
//   if (!studentsData || !Array.isArray(studentsData)) {
//     return res.status(400).json({ error: 'Invalid data format' });
//   }
//   connection.beginTransaction(err => {
//     if (err) {
//       console.error('Transaction error:', err);
//       return res.status(500).send('Internal Server Error');
//     }
//     connection.query('DELETE FROM students', (err) => {
//       if (err) {
//         console.error('Error deleting existing student data:', err);
//         return connection.rollback(() => res.status(500).send('Internal Server Error'));
//       }
//       const values = studentsData.map(item => [
//         item.registration_number,
//         item.name,
//         item.department,
//         item.subject_code,
//         item.date,
//         item.session
//       ]);
//       connection.query(
//         `INSERT INTO students (registration_number, name, department, subject_code, date, session) VALUES ?`,
//         [values],
//         (err) => {
//           if (err) {
//             console.error('Error inserting new student data:', err);
//             return connection.rollback(() => res.status(500).send('Internal Server Error'));
//           }
//           connection.commit(err => {
//             if (err) {
//               console.error('Commit error:', err);
//               return connection.rollback(() => res.status(500).send('Internal Server Error'));
//             }
//             res.json({ message: 'Student data replaced successfully!' });
//           });
//         }
//       );
//     });
//   });
// });

// app.post('/api/students/upload-xlsx', upload.single('file'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'No file provided' });
//   }
//   try {
//     const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const studentsData = XLSX.utils.sheet_to_json(worksheet);
    
//     connection.beginTransaction(err => {
//       if (err) {
//         console.error('Transaction error:', err);
//         return res.status(500).send('Internal Server Error');
//       }
//       connection.query('DELETE FROM students', (err) => {
//         if (err) {
//           console.error('Error deleting existing student data:', err);
//           return connection.rollback(() => res.status(500).send('Internal Server Error'));
//         }
//         const values = studentsData.map(item => [
//           item.registration_number,
//           item.name,
//           item.department,
//           item.subject_code,
//           item.date,
//           item.session
//         ]);
//         connection.query(
//           `INSERT INTO students (registration_number, name, department, subject_code, date, session) VALUES ?`,
//           [values],
//           (err) => {
//             if (err) {
//               console.error('Error inserting new student data:', err);
//               return connection.rollback(() => res.status(500).send('Internal Server Error'));
//             }
//             connection.commit(err => {
//               if (err) {
//                 console.error('Commit error:', err);
//                 return connection.rollback(() => res.status(500).send('Internal Server Error'));
//               }
//               res.json({ message: 'Student data replaced successfully from XLSX file!' });
//             });
//           }
//         );
//       });
//     });
//   } catch (error) {
//     console.error('Error processing XLSX file:', error);
//     res.status(500).json({ error: 'Failed to process file' });
//   }
// });

// /* ---------- Other Routes ---------- */
// app.get('/api/reports', (req, res) => {
//   res.json({ message: 'Reports feature is under development.' });
// });

// app.get('/api/settings', (req, res) => {
//   res.json({ message: 'Settings feature is under development.' });
// });

// // Start server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });



const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./config/db');
const dotenv=require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Database connection
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Middleware
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',  // Adjust as needed for your frontend URL
  credentials: true,
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET, // Replace with a strong secret
  resave: false,
  saveUninitialized: false,
}));

// Routes
app.use('/api', require('./routes/authRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/halls', require('./routes/hallRoutes'));
app.use('/api/slots', require('./routes/slotRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/session-strengths', require('./routes/sessionStrengthRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});