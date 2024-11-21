const db = require('../config/db');

class Volunteer {
  static create(volunteerData, callback) {
    const query = `
      INSERT INTO VOLUNTEERS (first_name, last_name, email, gender, phone, start_date, address, why_volunteer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      volunteerData.firstName,
      volunteerData.lastName,
      volunteerData.email,
      volunteerData.gender,
      volunteerData.phone,
      volunteerData.startDate,
      volunteerData.address,
      volunteerData.motivation
    ];

    db.query(query, values, (err, results) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, results);
    });
  }
}

module.exports = Volunteer;