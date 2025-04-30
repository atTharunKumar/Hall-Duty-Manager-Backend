const db = require('../config/db');
const XLSX = require('xlsx');

exports.getAllStudents = (req, res) => {
  db.query('SELECT * FROM students', (err, results) => {
    if (err) {
      console.error('Error fetching student data:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.json(results);
  });
};

exports.uploadStudentData = (req, res) => {
  const studentsData = req.body;
  
  if (!studentsData || !Array.isArray(studentsData)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }
  
  db.beginTransaction(err => {
    if (err) {
      console.error('Transaction error:', err);
      return res.status(500).send('Internal Server Error');
    }
    
    db.query('DELETE FROM students', (err) => {
      if (err) {
        console.error('Error deleting existing student data:', err);
        return db.rollback(() => res.status(500).send('Internal Server Error'));
      }
      
      const values = studentsData.map(item => [
        item.registration_number,
        item.name,
        item.department,
        item.subject_code,
        item.date,
        item.session
      ]);
      
      db.query(
        `INSERT INTO students (registration_number, name, department, subject_code, date, session) VALUES ?`,
        [values],
        (err) => {
          if (err) {
            console.error('Error inserting new student data:', err);
            return db.rollback(() => res.status(500).send('Internal Server Error'));
          }
          
          db.commit(err => {
            if (err) {
              console.error('Commit error:', err);
              return db.rollback(() => res.status(500).send('Internal Server Error'));
            }
            res.json({ message: 'Student data replaced successfully!' });
          });
        }
      );
    });
  });
};

exports.uploadStudentDataFromFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }
  
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const studentsData = XLSX.utils.sheet_to_json(worksheet);
    
    db.beginTransaction(err => {
      if (err) {
        console.error('Transaction error:', err);
        return res.status(500).send('Internal Server Error');
      }
      
      db.query('DELETE FROM students', (err) => {
        if (err) {
          console.error('Error deleting existing student data:', err);
          return db.rollback(() => res.status(500).send('Internal Server Error'));
        }
        
        const values = studentsData.map(item => [
          item.registration_number,
          item.name,
          item.department,
          item.subject_code,
          item.date,
          item.session
        ]);
        
        db.query(
          `INSERT INTO students (registration_number, name, department, subject_code, date, session) VALUES ?`,
          [values],
          (err) => {
            if (err) {
              console.error('Error inserting new student data:', err);
              return db.rollback(() => res.status(500).send('Internal Server Error'));
            }
            
            db.commit(err => {
              if (err) {
                console.error('Commit error:', err);
                return db.rollback(() => res.status(500).send('Internal Server Error'));
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
};