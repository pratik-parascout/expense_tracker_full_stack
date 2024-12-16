const jwt = require('jsonwebtoken');
const User = require('../model/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization');

    const user = jwt.verify(
      token,
      '2d4f5d7t5rt54g8r7y5s7g68s78g56e7ys456f7t8r4yr4gs78r7trgs'
    );
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
