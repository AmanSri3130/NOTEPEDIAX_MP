import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - check if cookie exists or Bearer token is valid
export const protect = async (req, res, next) => {
  let token = req.cookies?.jwt;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'notepediax_jwt_secret_key');
      const user = await User.findById(decoded.id);
      if (!user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      // Omit password hash before attaching to request
      delete user.password_hash;
      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      return res.json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401);
    return res.json({ success: false, message: 'Not authorized, no token' });
  }
};

// Role authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return res.json({
        success: false,
        message: `Role (${req.user?.role || 'none'}) is not authorized to access this resource`,
      });
    }
    next();
  };
};

// Optional authorization (attaches user if valid token present, allows guest otherwise)
export const optionalAuth = async (req, res, next) => {
  let token = req.cookies?.jwt;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'notepediax_jwt_secret_key');
      const user = await User.findById(decoded.id);
      if (user) {
        delete user.password_hash;
        req.user = user;
      }
    } catch (error) {
      console.warn('Optional auth token invalid, continuing as guest:', error.message);
    }
  }
  next();
};
