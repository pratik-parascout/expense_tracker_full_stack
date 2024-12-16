const jwt = require('jsonwebtoken');
const User = require('../model/User');
const jwtkey = process.env.JWT_KEY;

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization');

    const user = jwt.verify(token, jwtkey);
    // console.log(user.userId);

    User.findByPk(user.userId).then((user) => {
      req.user = user;

      next();
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token has expired' });
    }
    res.status(500).json({ msg: 'Authentication failed' });
  }
};

module.exports = { authenticate };
