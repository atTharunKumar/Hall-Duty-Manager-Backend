// const db = require('../db');
// const XLSX = require('xlsx');

// exports.getHalls = (req, res) => {
//   db.query('SELECT * FROM halls', (err, results) => {
//     if (err) return res.status(500).send('Error fetching halls');
//     res.json(results);
//   });
// };

// exports.addHall = (req, res) => {
//   const { name, capacity, ROW_S, COL_s } = req.body;
//   db.query('INSERT INTO halls (name, capacity) VALUES (?, ?)', [name, capacity], (err) => {
//     if (err) return res.status(500).send('Error adding hall');
//     db.query('UPDATE halls SET ROW_S = ?, COL_s = ? WHERE name = ?', [ROW_S, COL_s, name], (err) => {
//       if (err) return res.status(500).send('Error updating hall fields');
//       res.send({ message: "Hall added" });
//     });
//   });
// };

// exports.updateHall = (req, res) => {
//   const { id } = req.params;
//   const { name, capacity, ROW_S, COL_s } = req.body;
//   db.query('UPDATE halls SET name = ?, capacity = ?, ROW_S = ?, COL_s = ? WHERE id = ?', [name, capacity, ROW_S, COL_s, id], (err) => {
//     if (err) return res.status(500).send('Error updating hall');
//     res.json({ id, name, capacity, ROW_S, COL_s });
//   });
// };

// exports.uploadHalls = (req, res) => {
//   const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
//   const sheet = workbook.Sheets[workbook.SheetNames[0]];
//   const data = XLSX.utils.sheet_to_json(sheet);

//   db.beginTransaction(err => {
//     if (err) return res.status(500).send('Transaction error');

//     db.query('DELETE FROM halls', (err) => {
//       if (err) return db.rollback(() => res.status(500).send('Delete failed'));

//       const values = data.map(item => {
//         const rows = parseInt(item.ROW_S, 10);
//         const cols = parseInt(item.COL_s, 10);
//         const capacity = rows * cols;
//         return [item.name, capacity, rows, cols];
//       });

//       db.query('INSERT INTO halls (name, capacity, ROW_S, COL_s) VALUES ?', [values], (err) => {
//         if (err) return db.rollback(() => res.status(500).send('Insert failed'));
//         db.commit(err => {
//           if (err) return db.rollback(() => res.status(500).send('Commit failed'));
//           res.json({ message: 'Hall data uploaded successfully' });
//         });
//       });
//     });
//   });
// };


const db = require('../config/db');
const XLSX = require('xlsx');

exports.getAllHalls = (req, res) => {
  db.query('SELECT * FROM halls', (err, results) => {
    if (err) {
      console.error('Error fetching halls data:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.json(results);
  });
};

exports.addHall = (req, res) => {
  const { name, capacity, ROW_S, COL_s } = req.body;
  db.query('INSERT INTO halls (name, capacity) VALUES (?, ?)', 
    [name, capacity], 
    (err, results) => {
      if (err) {
        console.error('Error adding new hall:', err);
        return res.status(500).send('Internal Server Error');
      }
      // Update additional fields after insertion
      db.query('UPDATE halls SET ROW_S = ?, COL_s = ? WHERE name = ?', 
        [ROW_S, COL_s, name], 
        (err) => {
          if (err) {
            console.error('Error updating hall additional fields:', err);
            return res.status(500).send('Internal Server Error');
          }
          res.send({ message: "Hall added successfully" });
        }
      );
    }
  );
};

exports.updateHall = (req, res) => {
  const { id } = req.params;
  const { name, capacity, ROW_S, COL_s } = req.body;
  
  db.query('UPDATE halls SET name = ?, capacity = ?, ROW_S = ?, COL_s = ? WHERE id = ?', 
    [name, capacity, ROW_S, COL_s, id], 
    (err) => {
      if (err) {
        console.error('Error updating hall:', err);
        return res.status(500).send('Internal Server Error');
      }
      res.json({ id, name, capacity, ROW_S, COL_s });
    }
  );
};

exports.uploadHallsFromFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }
  
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const hallsData = XLSX.utils.sheet_to_json(worksheet);
    
    db.beginTransaction(err => {
      if (err) {
        console.error('Transaction error:', err);
        return res.status(500).send('Internal Server Error');
      }
      
      db.query('DELETE FROM halls', (err) => {
        if (err) {
          console.error('Error deleting existing halls:', err);
          return db.rollback(() => res.status(500).send('Internal Server Error'));
        }
        
        const values = hallsData.map(item => {
          const rows = parseInt(item.ROW_S, 10);
          const columns = parseInt(item.COL_s, 10);
          const capacity = rows * columns;
          return [item.name, capacity, rows, columns];
        });
        
        db.query(
          `INSERT INTO halls (name, capacity, ROW_S, COL_s) VALUES ?`,
          [values],
          (err) => {
            if (err) {
              console.error('Error inserting new hall data:', err);
              return db.rollback(() => res.status(500).send('Internal Server Error'));
            }
            
            db.commit(err => {
              if (err) {
                console.error('Commit error:', err);
                return db.rollback(() => res.status(500).send('Internal Server Error'));
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
};