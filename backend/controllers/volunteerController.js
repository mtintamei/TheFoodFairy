const db = require('../config/db');

exports.addVolunteer = (req, res) => {
  console.log('Received volunteer data:', req.body);
  const { firstname, lastname, email, gender, phone, start_date, address, why_volunteer } = req.body;

  if (!firstname || !lastname || !email || !gender || !phone || !start_date || !address || !why_volunteer) {
    return res.status(400).json({ message: 'Missing required fields', received: req.body });
  }

  // Check if volunteer with the same email already exists
  const checkEmailQuery = 'SELECT * FROM VOLUNTEERS WHERE email = ?';
  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: 'Volunteer with this email already exists' });
    }

    const volunteer = {
      first_name: firstname,
      last_name: lastname,
      email: email,
      gender: gender,
      phone: phone,
      start_date: start_date,
      address: address,
      why_volunteer: why_volunteer
    };

    let sql = 'INSERT INTO VOLUNTEERS SET ?';
    db.query(sql, volunteer, (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      console.log('Insert result:', result);
      res.status(201).json({ message: 'New volunteer added', volunteerId: result.insertId });
    });
  });
};