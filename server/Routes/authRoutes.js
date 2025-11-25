const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Please provide all required fields',
        missing: {
          username: !username,
          email: !email,
          password: !password
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Validate username length
    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      if (existingUser.username === username.toLowerCase()) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Create new user with plain text password
    // All new users are automatically assigned the 'applicant' role
    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role: 'applicant',
      isPending: false // Applicants don't need approval
    });

    // Save user
    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          console.error('JWT Sign Error:', err);
          return res.status(500).json({ message: 'Error generating token' });
        }

        // Send response with token and user data
        res.status(201).json({
          message: 'Registration successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            isPending: user.isPending
          }
        });
      }
    );
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', {
      id: user._id,
      email: user.email,
      role: user.role,
      isPending: user.isPending,
      approved: user.approved
    });

    // Check if HR account is pending
    if (user.role === 'hr' && user.isPending) {
      return res.status(403).json({
        message: 'Your HR account is pending verification. Please wait for admin approval before logging in.'
      });
    }

    // Check if HR account was rejected
    if (user.role === 'hr' && !user.isPending && !user.approved) {
      return res.status(403).json({
        message: 'Your HR account has been rejected. Please contact the administrator for more information.'
      });
    }

    // Validate password
    try {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log('Invalid password for user:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Password comparison error:', error);
      return res.status(500).json({ message: 'Error validating credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          console.error('JWT Sign Error:', err);
          return res.status(500).json({ message: 'Error generating token' });
        }

        // Send response with token and user data
        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            isPending: user.isPending,
            approved: user.approved
          }
        });
      }
    );
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Test endpoint to create HR user (remove in production)
router.post('/create-test-hr', async (req, res) => {
  try {
    // Check if test HR user already exists
    const existingHR = await User.findOne({ email: 'hr@test.com' });
    if (existingHR) {
      return res.json({
        message: 'Test HR user already exists',
        email: 'hr@test.com',
        password: 'hr123456'
      });
    }

    // Create test HR user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('hr123456', salt);

    const testHR = new User({
      username: 'testhr',
      email: 'hr@test.com',
      password: hashedPassword,
      role: 'hr'
    });

    await testHR.save();

    res.json({
      message: 'Test HR user created successfully',
      email: 'hr@test.com',
      password: 'hr123456',
      note: 'Use these credentials to login and test interview scheduling'
    });
  } catch (error) {
    console.error('Error creating test HR user:', error);
    res.status(500).json({ message: 'Error creating test HR user' });
  }
});

module.exports = router;