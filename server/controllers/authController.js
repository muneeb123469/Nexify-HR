const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || '10', {
    expiresIn: '30d'
  });
};

const validRoles = ['hr', 'applicant', 'employee', 'admin'];

exports.signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const requestedRole = role || 'applicant';
    if (!validRoles.includes(requestedRole)) {
      return res.status(400).json({ message: 'Invalid role. Supported roles are applicant, HR, employee, and admin.' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: requestedRole,
      isPending: requestedRole === 'hr',
      approved: requestedRole !== 'hr'
    });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isPending: user.isPending,
        approved: user.approved
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
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isPending: user.isPending,
        approved: user.approved
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
