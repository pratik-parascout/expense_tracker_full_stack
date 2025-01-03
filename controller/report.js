const path = require('path');

exports.getReport = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/report.html'));
};
