const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};