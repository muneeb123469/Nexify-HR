const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign({
    user: {
      id: userId,
      role: role
    }
  }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '24h' // Shorter expiration for better security
  });
};

const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  // Check for @ symbol
  if (!email.includes('@') || email.split('@').length !== 2) {
    return { isValid: false, error: 'Email must contain exactly one @ symbol' };
  }

  const [localPart, domainPart] = email.split('@');

  // Check if local part and domain exist
  if (!localPart || localPart.length === 0) {
    return { isValid: false, error: 'Email must have a local part before @' };
  }

  if (!domainPart || domainPart.length === 0) {
    return { isValid: false, error: 'Email must have a domain part after @' };
  }

  // Check local part length (max 64 characters)
  if (localPart.length > 64) {
    return { isValid: false, error: 'Local part of email cannot exceed 64 characters' };
  }

  // Check for consecutive periods in local part
  if (localPart.includes('..')) {
    return { isValid: false, error: 'Email cannot contain consecutive periods' };
  }

  // Check local part doesn't start or end with period
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { isValid: false, error: 'Local part cannot start or end with a period' };
  }

  // Check local part contains only valid characters (letters, digits, periods, underscores)
  if (!/^[a-zA-Z0-9._]+$/.test(localPart)) {
    return { isValid: false, error: 'Local part can only contain letters, digits, periods, and underscores' };
  }

  // Check domain format (must have at least one period)
  if (!domainPart.includes('.')) {
    return { isValid: false, error: 'Domain must contain at least one period' };
  }

  const domainParts = domainPart.split('.');

  // Check each domain part
  for (const part of domainParts) {
    if (part.length === 0) {
      return { isValid: false, error: 'Domain cannot have empty parts' };
    }

    if (part.startsWith('-') || part.endsWith('-')) {
      return { isValid: false, error: 'Domain parts cannot start or end with hyphen' };
    }

    if (!/^[a-zA-Z0-9-]+$/.test(part)) {
      return { isValid: false, error: 'Domain can only contain letters, digits, and hyphens' };
    }
  }

  // Check TLD is alphabetic only (last part after final period)
  const tld = domainParts[domainParts.length - 1];
  if (!/^[a-zA-Z]+$/.test(tld)) {
    return { isValid: false, error: 'Top-level domain must contain only letters' };
  }

  if (tld.length < 2) {
    return { isValid: false, error: 'Top-level domain must be at least 2 characters' };
  }

  return { isValid: true };
};

exports.signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Email format validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.error });
    }

    // Role validation
    const validRoles = ['hr', 'applicant', 'employee'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
        field: existingUser.email === email ? 'email' : 'username'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: role || 'applicant' // Default to applicant if no role specified
    });
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 