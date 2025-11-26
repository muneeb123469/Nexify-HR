const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register - Step 1: Send verification code
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

    // Check if user already exists in database
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

    // Store registration data temporarily and generate verification code
    const { storeRegistration } = require('../utils/registrationStorage');
    const result = storeRegistration(email, username, password);

    if (!result.success) {
      return res.status(429).json({ message: result.error });
    }

    // Send verification code via email
    const { sendRegistrationVerificationEmail } = require('../services/emailService');
    const emailResult = await sendRegistrationVerificationEmail(email, result.code);

    if (!emailResult.success) {
      return res.status(500).json({
        message: 'Failed to send verification code. Please try again later.',
        error: emailResult.error
      });
    }

    // Calculate expiry time for frontend display
    const expiresInMinutes = Math.ceil((result.expiresAt - Date.now()) / 1000 / 60);

    res.json({
      message: 'Verification code sent to your email',
      email: email.toLowerCase(),
      expiresInMinutes
    });

  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Register - Step 2: Verify code and create account
router.post('/verify-registration', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validate inputs
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Verify the code
    const { verifyRegistrationCode, clearRegistration } = require('../utils/registrationStorage');
    const result = verifyRegistrationCode(email, code);

    if (!result.valid) {
      return res.status(400).json({ message: result.error });
    }

    // Get registration data
    const { username, password } = result.registrationData;

    // Check one more time if user exists (in case they registered elsewhere)
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      clearRegistration(email);
      return res.status(400).json({ message: 'User already exists. Please log in.' });
    }

    // Create new user
    const user = new User({
      username: username,
      email: email,
      password: password,
      role: 'applicant',
      isPending: false
    });

    // Save user
    await user.save();

    // Clear registration data
    clearRegistration(email);

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
          message: 'Registration successful! Welcome!',
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
    console.error('Verification Error:', err);
    res.status(500).json({
      message: 'Server error during verification',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Resend registration verification code
router.post('/resend-registration-code', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if pending registration exists
    const { getRegistrationData, storeRegistration } = require('../utils/registrationStorage');
    const existingRegistration = getRegistrationData(email);

    if (!existingRegistration) {
      return res.status(404).json({
        message: 'No pending registration found. Please register again.'
      });
    }

    // Generate new code and update storage
    const result = storeRegistration(email, existingRegistration.username, existingRegistration.password);

    if (!result.success) {
      return res.status(429).json({ message: result.error });
    }

    // Send new verification code via email
    const { sendRegistrationVerificationEmail } = require('../services/emailService');
    const emailResult = await sendRegistrationVerificationEmail(email, result.code);

    if (!emailResult.success) {
      return res.status(500).json({
        message: 'Failed to send verification code. Please try again later.',
        error: emailResult.error
      });
    }

    // Calculate expiry time
    const expiresInMinutes = Math.ceil((result.expiresAt - Date.now()) / 1000 / 60);

    res.json({
      message: 'New verification code sent to your email',
      expiresInMinutes
    });

  } catch (error) {
    console.error('Resend registration code error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
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

// ========== Forgot Password Routes ==========

// Step 1: Request password reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate and store verification code
    const { storeVerificationCode } = require('../utils/verificationCodes');
    const result = storeVerificationCode(email);

    if (!result.success) {
      return res.status(429).json({ message: result.error });
    }

    // Send verification code via email
    const { sendPasswordResetEmail } = require('../services/emailService');
    const emailResult = await sendPasswordResetEmail(email, result.code);

    if (!emailResult.success) {
      return res.status(500).json({
        message: 'Failed to send verification code. Please try again later.',
        error: emailResult.error
      });
    }

    // Calculate expiry time for frontend display
    const expiresInMinutes = Math.ceil((result.expiresAt - Date.now()) / 1000 / 60);

    res.json({
      message: 'Verification code sent to your email',
      expiresInMinutes,
      email: email.toLowerCase()
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Step 2: Verify reset code
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validate inputs
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Verify the code
    const { verifyCode } = require('../utils/verificationCodes');
    const result = verifyCode(email, code);

    if (!result.valid) {
      return res.status(400).json({ message: result.error });
    }

    res.json({
      message: 'Code verified successfully',
      valid: true,
      email: email.toLowerCase()
    });

  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Step 3: Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validate inputs
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if code was verified
    const { hasVerifiedCode, clearVerificationCode } = require('../utils/verificationCodes');
    if (!hasVerifiedCode(email)) {
      return res.status(403).json({
        message: 'Please verify your code before resetting password'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      clearVerificationCode(email);
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password (plain text as per user requirement)
    user.password = newPassword;
    await user.save();

    // Clear the verification code
    clearVerificationCode(email);

    console.log(`Password reset successful for: ${email}`);

    res.json({
      message: 'Password reset successfully. You can now login with your new password.',
      success: true
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;