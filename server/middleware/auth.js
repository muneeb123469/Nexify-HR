// D:/FYP Project/Backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware function.
 * Verifies the JWT token in the Authorization header and checks if the user exists in the database.
 * If the token is valid and the user exists, it adds the user to the request object and calls the next middleware function.
 * If the token is invalid or the user does not exist, it returns a 401 Unauthorized response.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the chain.
 */
const auth = async (req, res, next) => {
  try {
    // Get the JWT token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Check if the token exists
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get the user ID from the decoded token
    // Fix: The JWT payload structure is { user: { id, role } }
    const userId = decoded.user ? decoded.user.id : decoded.id;
    console.log('Auth middleware - Token decoded:', { userId, decodedStructure: decoded });
    
    // Find the user in the database
    const user = await User.findById(userId).select('-password');

    // Check if the user exists
    if (!user) {
      console.log('Auth middleware - User not found for ID:', userId);
      return res.status(401).json({ message: 'User not found' });
    }

    // Log the user details
    console.log('Auth middleware - User found:', { id: user._id, role: user.role, email: user.email });
    
    // Add the user to the request object
    req.user = user;
    
    // Call the next middleware function
    next();
  } catch (error) {
    // Log the error
    console.error('Auth middleware error:', error);
    
    // Return a 401 Unauthorized response
    res.status(401).json({ message: 'Token is not valid' });
  }
};

/**
 * Authorization middleware function.
 * Checks if the user has the required role to access a route.
 * If the user has the required role, it calls the next middleware function.
 * If the user does not have the required role, it returns a 403 Forbidden response.
 * 
 * @param {...String} roles - The required roles.
 * @returns {Function} The middleware function.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user has the required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    
    // Call the next middleware function
    next();
  };
};

// Export the middleware functions
module.exports = { auth, authorize };
