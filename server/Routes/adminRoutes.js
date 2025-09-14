const express = require('express');
const router = express.Router();
const User = require('../models/User');

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