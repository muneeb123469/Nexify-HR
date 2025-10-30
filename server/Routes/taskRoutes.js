const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { auth: verifyToken } = require('../middleware/auth');

// Middleware to check if user is HR or Admin
const isHROrAdmin = (req, res, next) => {
  if (req.user.role !== 'hr' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. HR or Admin role required.' });
  }
  next();
};

// @route   POST /api/tasks/assign
// @desc    Assign a new task to an employee (HR/Admin only)
// @access  Private (HR/Admin)
router.post('/assign', verifyToken, isHROrAdmin, async (req, res) => {
  try {
    const {
      employeeId,
      title,
      description,
      priority,
      category,
      taskType,
      dueDate,
      estimatedHours,
      milestones,
      notes
    } = req.body;

    // Validate required fields
    if (!employeeId || !title || !description || !priority || !category || !taskType || !dueDate || !estimatedHours) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: employeeId, title, description, priority, category, taskType, dueDate, estimatedHours' 
      });
    }

    // Fetch employee details
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.role !== 'employee') {
      return res.status(400).json({ message: 'Selected user is not an employee' });
    }

    // Create new task
    const task = new Task({
      employeeId: employee._id,
      employeeName: employee.username,
      employeeEmail: employee.email,
      employeeDepartment: employee.department || 'Not Specified',
      title,
      description,
      priority,
      category,
      taskType,
      dueDate: new Date(dueDate),
      estimatedHours,
      milestones: milestones || [],
      assignedBy: req.user._id,
      assignedByName: req.user.username,
      assignedByRole: req.user.role,
      notes: notes || ''
    });

    await task.save();

    res.status(201).json({
      message: 'Task assigned successfully',
      task
    });
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ 
      message: 'Error assigning task', 
      error: error.message 
    });
  }
});

// @route   GET /api/tasks/employee/:employeeId
// @desc    Get all tasks for a specific employee
// @access  Private
router.get('/employee/:employeeId', verifyToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, priority, category } = req.query;

    // Check if user is accessing their own tasks or if they're HR/Admin
    if (req.user._id.toString() !== employeeId && req.user.role !== 'hr' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (category) filters.category = category;

    const tasks = await Task.getTasksByEmployee(employeeId, filters);

    res.json({
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Error fetching employee tasks:', error);
    res.status(500).json({ 
      message: 'Error fetching tasks', 
      error: error.message 
    });
  }
});

// @route   GET /api/tasks/my-tasks
// @desc    Get all tasks for the logged-in employee
// @access  Private (Employee)
router.get('/my-tasks', verifyToken, async (req, res) => {
  try {
    const { status, priority, category, search } = req.query;

    const filters = { employeeId: req.user._id, isActive: true };
    
    if (status && status !== 'all') {
      filters.status = status;
    }
    
    if (priority && priority !== 'all') {
      filters.priority = priority;
    }
    
    if (category && category !== 'all') {
      filters.category = category;
    }

    let tasks = await Task.find(filters).sort({ createdAt: -1 });

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      tasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Error fetching my tasks:', error);
    res.status(500).json({ 
      message: 'Error fetching tasks', 
      error: error.message 
    });
  }
});

// @route   GET /api/tasks/assigned-by-me
// @desc    Get all tasks assigned by the logged-in HR/Admin
// @access  Private (HR/Admin)
router.get('/assigned-by-me', verifyToken, isHROrAdmin, async (req, res) => {
  try {
    const { status, employeeId } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (employeeId) filters.employeeId = employeeId;

    const tasks = await Task.getTasksByAssigner(req.user._id, filters);

    res.json({
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    res.status(500).json({ 
      message: 'Error fetching tasks', 
      error: error.message 
    });
  }
});

// @route   GET /api/tasks/all
// @desc    Get all tasks (HR/Admin only)
// @access  Private (HR/Admin)
router.get('/all', verifyToken, isHROrAdmin, async (req, res) => {
  try {
    const { status, priority, employeeId, category } = req.query;

    const filters = { isActive: true };
    
    if (status && status !== 'all') {
      filters.status = status;
    }
    
    if (priority && priority !== 'all') {
      filters.priority = priority;
    }
    
    if (category && category !== 'all') {
      filters.category = category;
    }
    
    if (employeeId) {
      filters.employeeId = employeeId;
    }

    const tasks = await Task.find(filters)
      .populate('employeeId', 'name email department')
      .populate('assignedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    res.status(500).json({ 
      message: 'Error fetching tasks', 
      error: error.message 
    });
  }
});

// @route   GET /api/tasks/employees/list
// @desc    Get list of all employees for task assignment (HR/Admin only)
// @access  Private (HR/Admin)
router.get('/employees/list', verifyToken, isHROrAdmin, async (req, res) => {
  try {
    const employees = await User.find({ 
      role: 'employee',
      status: { $ne: 'Terminated' }
    })
    .select('username email department jobTitle')
    .sort({ username: 1 });

    console.log('Fetched employees for task assignment:', employees.length, 'employees');
    console.log('Sample employee:', employees[0]);

    res.json({
      count: employees.length,
      employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ 
      message: 'Error fetching employees', 
      error: error.message 
    });
  }
});

// @route   GET /api/tasks/stats/employee/:employeeId
// @desc    Get task statistics for an employee
// @access  Private
router.get('/stats/employee/:employeeId', verifyToken, async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Check if user is accessing their own stats or if they're HR/Admin
    if (req.user._id.toString() !== employeeId && req.user.role !== 'hr' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await Task.getEmployeeStats(employeeId);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({ 
      message: 'Error fetching statistics', 
      error: error.message 
    });
  }
});

// @route   GET /api/tasks/:taskId
// @desc    Get a specific task by ID
// @access  Private
router.get('/:taskId', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('employeeId', 'name email department')
      .populate('assignedBy', 'name role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to this task
    if (
      task.employeeId._id.toString() !== req.user._id.toString() &&
      task.assignedBy._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'hr' &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ 
      message: 'Error fetching task', 
      error: error.message 
    });
  }
});

// @route   PUT /api/tasks/:taskId/status
// @desc    Update task status
// @access  Private
router.put('/:taskId/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'in_progress', 'completed', 'overdue'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is the assigned employee or HR/Admin
    if (
      task.employeeId.toString() !== req.user._id.toString() &&
      req.user.role !== 'hr' &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.status = status;
    
    if (status === 'completed') {
      task.completedDate = new Date();
      task.progress = 100;
    }

    await task.save();

    res.json({
      message: 'Task status updated successfully',
      task
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ 
      message: 'Error updating task status', 
      error: error.message 
    });
  }
});

// @route   PUT /api/tasks/:taskId/progress
// @desc    Update task progress
// @access  Private
router.put('/:taskId/progress', verifyToken, async (req, res) => {
  try {
    const { progress } = req.body;

    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be between 0 and 100' });
    }

    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is the assigned employee
    if (task.employeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.progress = progress;
    
    if (progress === 100 && task.status !== 'completed') {
      task.status = 'completed';
      task.completedDate = new Date();
    }

    await task.save();

    res.json({
      message: 'Task progress updated successfully',
      task
    });
  } catch (error) {
    console.error('Error updating task progress:', error);
    res.status(500).json({ 
      message: 'Error updating task progress', 
      error: error.message 
    });
  }
});

// @route   PUT /api/tasks/:taskId/milestone/:milestoneId
// @desc    Update milestone status
// @access  Private
router.put('/:taskId/milestone/:milestoneId', verifyToken, async (req, res) => {
  try {
    const { completed } = req.body;

    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is the assigned employee
    if (task.employeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.updateMilestone(req.params.milestoneId, completed);

    res.json({
      message: 'Milestone updated successfully',
      task
    });
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ 
      message: 'Error updating milestone', 
      error: error.message 
    });
  }
});

// @route   POST /api/tasks/:taskId/comment
// @desc    Add a comment to a task
// @access  Private
router.post('/:taskId/comment', verifyToken, async (req, res) => {
  try {
    const { message, type } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Comment message is required' });
    }

    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to this task
    if (
      task.employeeId.toString() !== req.user._id.toString() &&
      task.assignedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'hr' &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const commentData = {
      author: req.user.username,
      authorId: req.user._id,
      role: req.user.role,
      message,
      type: type || 'update'
    };

    await task.addComment(commentData);

    res.json({
      message: 'Comment added successfully',
      task
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      message: 'Error adding comment', 
      error: error.message 
    });
  }
});

// @route   PUT /api/tasks/:taskId
// @desc    Update a task (HR/Admin only)
// @access  Private (HR/Admin)
router.put('/:taskId', verifyToken, isHROrAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      category,
      taskType,
      dueDate,
      estimatedHours,
      milestones,
      notes
    } = req.body;

    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update fields if provided
    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (category) task.category = category;
    if (taskType) task.taskType = taskType;
    if (dueDate) task.dueDate = new Date(dueDate);
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (milestones) task.milestones = milestones;
    if (notes !== undefined) task.notes = notes;

    await task.save();

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ 
      message: 'Error updating task', 
      error: error.message 
    });
  }
});

// @route   DELETE /api/tasks/:taskId
// @desc    Delete a task (soft delete - HR/Admin only)
// @access  Private (HR/Admin)
router.delete('/:taskId', verifyToken, isHROrAdmin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.isActive = false;
    await task.save();

    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ 
      message: 'Error deleting task', 
      error: error.message 
    });
  }
});

module.exports = router;
