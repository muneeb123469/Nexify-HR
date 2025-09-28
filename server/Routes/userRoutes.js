const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    console.log('Authentication middleware called');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Auth header:', authHeader);
    console.log('Token:', token ? 'Present' : 'Missing');

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            console.log('Token verification failed:', err.message);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        console.log('Token verified for user:', user.user.id);
        req.user = user;
        next();
    });
};

// Test route to check if user routes are working
router.get('/test', (req, res) => {
    res.json({ message: 'User routes are working!' });
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        console.log('Profile request received for user ID:', req.user.user.id);
        const user = await User.findById(req.user.user.id).select('-password');

        if (!user) {
            console.log('User not found with ID:', req.user.user.id);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User found:', user.username);
        res.json({
            success: true,
            user: user
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user.id;
        const { username, email, phone, skills, department, jobTitle, emergencyContacts, address } = req.body;

        // Validate required fields
        if (!username || !email) {
            return res.status(400).json({ message: 'Username and email are required' });
        }

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await User.findOne({
                email: email.toLowerCase(),
                _id: { $ne: userId }
            });

            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use by another account' });
            }
        }

        // Check if username is already taken by another user
        if (username) {
            const existingUser = await User.findOne({
                username: username.toLowerCase(),
                _id: { $ne: userId }
            });

            if (existingUser) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        // Prepare update data
        const updateData = {
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            updatedAt: new Date()
        };

        // Add optional fields if provided
        if (phone !== undefined) updateData.phone = phone;
        if (skills !== undefined) updateData.skills = skills;
        if (department !== undefined) updateData.department = department;
        if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
        if (emergencyContacts !== undefined) updateData.emergencyContacts = emergencyContacts;
        if (address !== undefined) updateData.address = address;

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user profile:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({ message: 'Server error while updating profile' });
    }
});

module.exports = router;