const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get all employees
router.get('/employees', auth, async (req, res) => {
  try {
    // Only HR can access employee data
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied. HR role required.' });
    }

    const employees = await User.find({ role: 'employee' })
      .select('-password')
      .populate('manager', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      employees: employees.map(emp => ({
        id: emp._id,
        employeeId: emp.employeeId,
        name: emp.username,
        email: emp.email,
        department: emp.department,
        role: emp.jobTitle,
        phone: emp.phone,
        status: emp.status,
        hireDate: emp.hireDate,
        salary: emp.salary,
        manager: emp.manager,
        lastModified: emp.updatedAt,
        createdAt: emp.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

// Get single employee
router.get('/employees/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied. HR role required.' });
    }

    const employee = await User.findById(req.params.id)
      .select('-password')
      .populate('manager', 'username email');

    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      success: true,
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.username,
        email: employee.email,
        department: employee.department,
        role: employee.jobTitle,
        phone: employee.phone,
        status: employee.status,
        hireDate: employee.hireDate,
        salary: employee.salary,
        manager: employee.manager,
        lastModified: employee.updatedAt,
        createdAt: employee.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Error fetching employee' });
  }
});

// Create new employee
router.post('/employees', auth, async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied. HR role required.' });
    }

    const { name, email, department, jobTitle, phone, hireDate, salary, managerId } = req.body;

    // Validate required fields
    if (!name || !email || !department || !jobTitle) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: name, email, department, jobTitle' 
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Validate manager if provided
    let manager = null;
    if (managerId) {
      manager = await User.findById(managerId);
      if (!manager || (manager.role !== 'hr' && manager.role !== 'employee')) {
        return res.status(400).json({ message: 'Invalid manager selected' });
      }
    }

    // Create new employee
    const employee = new User({
      username: name,
      email: email.toLowerCase(),
      password: 'temp123456', // Temporary password - should be changed on first login
      role: 'employee',
      department,
      jobTitle,
      phone,
      hireDate: hireDate ? new Date(hireDate) : new Date(),
      salary: salary ? parseFloat(salary) : null,
      manager: managerId || null,
      status: 'Active'
    });

    await employee.save();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.username,
        email: employee.email,
        department: employee.department,
        role: employee.jobTitle,
        phone: employee.phone,
        status: employee.status,
        hireDate: employee.hireDate,
        salary: employee.salary,
        lastModified: employee.updatedAt,
        createdAt: employee.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Error creating employee' });
  }
});

// Update employee
router.put('/employees/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied. HR role required.' });
    }

    const { name, email, department, jobTitle, phone, status, hireDate, salary, managerId } = req.body;

    const employee = await User.findById(req.params.id);
    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if email is being changed and if it already exists
    if (email && email.toLowerCase() !== employee.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: employee._id }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Validate manager if provided
    if (managerId && managerId !== employee.manager?.toString()) {
      const manager = await User.findById(managerId);
      if (!manager || (manager.role !== 'hr' && manager.role !== 'employee')) {
        return res.status(400).json({ message: 'Invalid manager selected' });
      }
    }

    // Update employee fields
    if (name) employee.username = name;
    if (email) employee.email = email.toLowerCase();
    if (department) employee.department = department;
    if (jobTitle) employee.jobTitle = jobTitle;
    if (phone) employee.phone = phone;
    if (status) employee.status = status;
    if (hireDate) employee.hireDate = new Date(hireDate);
    if (salary !== undefined) employee.salary = salary ? parseFloat(salary) : null;
    if (managerId !== undefined) employee.manager = managerId || null;

    await employee.save();

    res.json({
      success: true,
      message: 'Employee updated successfully',
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.username,
        email: employee.email,
        department: employee.department,
        role: employee.jobTitle,
        phone: employee.phone,
        status: employee.status,
        hireDate: employee.hireDate,
        salary: employee.salary,
        lastModified: employee.updatedAt,
        createdAt: employee.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Error updating employee' });
  }
});

// Delete employee (soft delete by changing status)
router.delete('/employees/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied. HR role required.' });
    }

    const employee = await User.findById(req.params.id);
    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Soft delete by changing status
    employee.status = 'Terminated';
    await employee.save();

    res.json({
      success: true,
      message: 'Employee terminated successfully'
    });
  } catch (error) {
    console.error('Error terminating employee:', error);
    res.status(500).json({ message: 'Error terminating employee' });
  }
});

// Get managers list (for dropdown)
router.get('/managers', auth, async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied. HR role required.' });
    }

    const managers = await User.find({ 
      $or: [
        { role: 'hr' },
        { role: 'employee', jobTitle: { $regex: /manager|lead|supervisor/i } }
      ]
    }).select('_id username email jobTitle department');

    res.json({
      success: true,
      managers: managers.map(manager => ({
        id: manager._id,
        name: manager.username,
        email: manager.email,
        title: manager.jobTitle,
        department: manager.department
      }))
    });
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(500).json({ message: 'Error fetching managers' });
  }
});

module.exports = router;
