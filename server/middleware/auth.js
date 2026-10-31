const jwt = require('jsonwebtoken');
const { getStore } = require('../data/store');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'veera_naturals_super_secret_jwt_key_2026_botanical');
    const store = getStore();
    const user = store.users.find(u => u.id === decoded.id || u._id === decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Attach user (without password)
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};

module.exports = { protect };
