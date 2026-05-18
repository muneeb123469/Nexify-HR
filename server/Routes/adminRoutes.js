const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

router.use(auth, authorize('admin'));

// Get all HR users
router.get('/hr-list', async (req, res) => {
  try {
    const hrUsers = await User.find({ role: 'hr' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(hrUsers);
  } catch (err) {
    console.error('Error fetching HR list:', err);
    res.status(500).json({ message: 'Error fetching HR list' });
  }
});

// Create new HR user
router.post('/hr-create', async (req, res) => {
  try {
    const { username, email, password, department, phone, jobTitle } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Check for duplicate username or email
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Create new HR user
    const newHR = new User({
      username,
      email,
      password,
      role: 'hr',
      department: department || '',
      phone: phone || '',
      jobTitle: jobTitle || 'HR Manager',
      isPending: false,
      approved: true,
      status: 'Active'
    });

    await newHR.save();

    // Return user without password
    const hrUser = newHR.toJSON();
    res.status(201).json({
      message: 'HR user created successfully',
      user: hrUser
    });
  } catch (err) {
    console.error('Error creating HR user:', err);
    res.status(500).json({ message: 'Error creating HR user', error: err.message });
  }
});

// Update HR user
router.put('/hr-update/:hrId', async (req, res) => {
  try {
    const { hrId } = req.params;
    const { username, email, department, phone, jobTitle, status } = req.body;

    // Find HR user
    const hrUser = await User.findById(hrId);
    if (!hrUser || hrUser.role !== 'hr') {
      return res.status(404).json({ message: 'HR user not found' });
    }

    // Check for duplicate username or email (excluding current user)
    if (username || email) {
      const duplicateQuery = {
        _id: { $ne: hrId },
        $or: []
      };

      if (username) duplicateQuery.$or.push({ username });
      if (email) duplicateQuery.$or.push({ email });

      if (duplicateQuery.$or.length > 0) {
        const existingUser = await User.findOne(duplicateQuery);
        if (existingUser) {
          if (existingUser.username === username) {
            return res.status(400).json({ message: 'Username already exists' });
          }
          if (existingUser.email === email) {
            return res.status(400).json({ message: 'Email already exists' });
          }
        }
      }
    }

    // Update fields if provided
    if (username) hrUser.username = username;
    if (email) hrUser.email = email;
    if (department !== undefined) hrUser.department = department;
    if (phone !== undefined) hrUser.phone = phone;
    if (jobTitle !== undefined) hrUser.jobTitle = jobTitle;
    if (status) hrUser.status = status;

    await hrUser.save();

    // Return updated user without password
    const updatedUser = hrUser.toJSON();
    res.json({
      message: 'HR user updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Error updating HR user:', err);
    res.status(500).json({ message: 'Error updating HR user', error: err.message });
  }
});

// Delete HR user
router.delete('/hr-delete/:hrId', async (req, res) => {
  try {
    const { hrId } = req.params;

    // Find HR user
    const hrUser = await User.findById(hrId);
    if (!hrUser || hrUser.role !== 'hr') {
      return res.status(404).json({ message: 'HR user not found' });
    }

    // Delete the user
    await User.findByIdAndDelete(hrId);

    res.json({
      message: 'HR user deleted successfully',
      deletedUser: {
        id: hrUser._id,
        username: hrUser.username,
        email: hrUser.email
      }
    });
  } catch (err) {
    console.error('Error deleting HR user:', err);
    res.status(500).json({ message: 'Error deleting HR user', error: err.message });
  }
});

// Handle HR approval/rejection
router.post('/hr-approval', async (req, res) => {
  try {
    const { hrId, action } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const hrUser = await User.findById(hrId);
    if (!hrUser || hrUser.role !== 'hr') {
      return res.status(404).json({ message: 'HR user not found' });
    }

    if (action === 'approve') {
      hrUser.isPending = false;
      hrUser.approved = true;
    } else {
      hrUser.isPending = false;
      hrUser.approved = false;
    }

    await hrUser.save();

    res.json({
      message: `HR profile ${action}d successfully`,
      user: {
        id: hrUser._id,
        username: hrUser.username,
        email: hrUser.email,
        role: hrUser.role,
        isPending: hrUser.isPending,
        approved: hrUser.approved
      }
    });
  } catch (err) {
    console.error('Error handling HR approval:', err);
    res.status(500).json({ message: 'Error handling HR approval' });
  }
});

module.exports = router;
