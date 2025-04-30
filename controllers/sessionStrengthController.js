const db = require('../config/db');

exports.getAllSessionStrengths = (req, res) => {
  db.query('SELECT * FROM session_strengths ORDER BY day', (err, results) => {
    if (err) {
      console.error('Error fetching session strengths:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.json(results);
  });
};

exports.updateSessionStrengths = (req, res) => {
  const { sessionStrengths } = req.body;
  
  db.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).send('Internal Server Error');
    }
    
    db.query('DELETE FROM session_strengths', (err) => {
      if (err) {
        console.error('Error deleting existing session strengths:', err);
        return db.rollback(() => res.status(500).send('Internal Server Error'));
      }
      
      const values = sessionStrengths.map(({ day, exam1, exam2 }) => [
        day, exam1.name, exam1.strength, exam2.name, exam2.strength
      ]);
      
      db.query(
        'INSERT INTO session_strengths (day, exam1_name, exam1_strength, exam2_name, exam2_strength) VALUES ?',
        [values],
        (err) => {
          if (err) {
            console.error('Error inserting new session strengths:', err);
            return db.rollback(() => res.status(500).send('Internal Server Error'));
          }
          
          db.commit((err) => {
            if (err) {
              console.error('Error committing transaction:', err);
              return db.rollback(() => res.status(500).send('Internal Server Error'));
            }
            res.json({ message: 'Session strengths updated successfully!' });
          });
        }
      );
    });
  });
};