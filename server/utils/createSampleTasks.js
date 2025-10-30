const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
require('dotenv').config();

const createSampleTasks = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal';
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected');

    // Find HR user and employees
    const hrUser = await User.findOne({ role: 'hr' });
    if (!hrUser) {
      console.log('No HR user found. Please create an HR user first.');
      process.exit(1);
    }

    const employees = await User.find({ role: 'employee' }).limit(3);
    if (employees.length === 0) {
      console.log('No employees found. Please create employees first.');
      process.exit(1);
    }

    console.log(`Found HR user: ${hrUser.username}`);
    console.log(`Found ${employees.length} employees`);

    // Clear existing sample tasks (optional)
    await Task.deleteMany({});
    console.log('Cleared existing tasks');

    // Sample tasks data
    const sampleTasks = [
      {
        employeeId: employees[0]._id,
        employeeName: employees[0].username,
        employeeEmail: employees[0].email,
        employeeDepartment: employees[0].department || 'Engineering',
        title: 'Complete Q4 Financial Report',
        description: 'Prepare comprehensive financial analysis for Q4 2024 including revenue, expenses, and projections',
        priority: 'high',
        category: 'reporting',
        taskType: 'monthly',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        estimatedHours: 20,
        status: 'in_progress',
        progress: 60,
        milestones: [
          { title: 'Data Collection', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), completed: true },
          { title: 'Analysis & Charts', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), completed: true },
          { title: 'Final Review', dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), completed: false }
        ],
        comments: [
          {
            author: employees[0].username,
            authorId: employees[0]._id,
            role: 'employee',
            message: 'Started data collection from all departments',
            type: 'update'
          },
          {
            author: employees[0].username,
            authorId: employees[0]._id,
            role: 'employee',
            message: 'Completed initial analysis and created charts',
            type: 'update'
          }
        ],
        assignedBy: hrUser._id,
        assignedByName: hrUser.username,
        assignedByRole: hrUser.role
      },
      {
        employeeId: employees[1] ? employees[1]._id : employees[0]._id,
        employeeName: employees[1] ? employees[1].username : employees[0].username,
        employeeEmail: employees[1] ? employees[1].email : employees[0].email,
        employeeDepartment: employees[1] ? (employees[1].department || 'Marketing') : 'Marketing',
        title: 'Update Marketing Campaign',
        description: 'Revise social media marketing strategy for new product launch',
        priority: 'medium',
        category: 'marketing',
        taskType: 'project-based',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        estimatedHours: 15,
        status: 'completed',
        progress: 100,
        milestones: [
          { title: 'Market Research', dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), completed: true, completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          { title: 'Strategy Development', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), completed: true, completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { title: 'Campaign Launch', dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), completed: true, completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ],
        comments: [
          {
            author: employees[1] ? employees[1].username : employees[0].username,
            authorId: employees[1] ? employees[1]._id : employees[0]._id,
            role: 'employee',
            message: 'Research completed ahead of schedule',
            type: 'update'
          },
          {
            author: employees[1] ? employees[1].username : employees[0].username,
            authorId: employees[1] ? employees[1]._id : employees[0]._id,
            role: 'employee',
            message: 'Campaign launched successfully',
            type: 'update'
          }
        ],
        assignedBy: hrUser._id,
        assignedByName: hrUser.username,
        assignedByRole: hrUser.role,
        completedDate: new Date()
      },
      {
        employeeId: employees[2] ? employees[2]._id : employees[0]._id,
        employeeName: employees[2] ? employees[2].username : employees[0].username,
        employeeEmail: employees[2] ? employees[2].email : employees[0].email,
        employeeDepartment: employees[2] ? (employees[2].department || 'Sales') : 'Sales',
        title: 'Client Follow-up Calls',
        description: 'Contact all pending clients for project updates and gather feedback',
        priority: 'high',
        category: 'sales',
        taskType: 'weekly',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
        estimatedHours: 8,
        status: 'overdue',
        progress: 30,
        milestones: [
          { title: 'Prepare Client List', dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), completed: true, completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          { title: 'Initial Calls', dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), completed: false },
          { title: 'Follow-up & Reports', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), completed: false }
        ],
        comments: [
          {
            author: employees[2] ? employees[2].username : employees[0].username,
            authorId: employees[2] ? employees[2]._id : employees[0]._id,
            role: 'employee',
            message: 'Client list prepared with 25 contacts',
            type: 'update'
          }
        ],
        assignedBy: hrUser._id,
        assignedByName: hrUser.username,
        assignedByRole: hrUser.role
      },
      {
        employeeId: employees[0]._id,
        employeeName: employees[0].username,
        employeeEmail: employees[0].email,
        employeeDepartment: employees[0].department || 'IT',
        title: 'System Security Audit',
        description: 'Conduct comprehensive security review of all systems and infrastructure',
        priority: 'high',
        category: 'technical',
        taskType: 'project-based',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        estimatedHours: 25,
        status: 'pending',
        progress: 0,
        milestones: [
          { title: 'Initial Assessment', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), completed: false },
          { title: 'Vulnerability Testing', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), completed: false },
          { title: 'Report Generation', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), completed: false }
        ],
        comments: [],
        assignedBy: hrUser._id,
        assignedByName: hrUser.username,
        assignedByRole: hrUser.role
      },
      {
        employeeId: employees[1] ? employees[1]._id : employees[0]._id,
        employeeName: employees[1] ? employees[1].username : employees[0].username,
        employeeEmail: employees[1] ? employees[1].email : employees[0].email,
        employeeDepartment: employees[1] ? (employees[1].department || 'Design') : 'Design',
        title: 'Website Redesign Mockups',
        description: 'Create new design mockups for company website homepage and landing pages',
        priority: 'medium',
        category: 'design',
        taskType: 'project-based',
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        estimatedHours: 18,
        status: 'in_progress',
        progress: 45,
        milestones: [
          { title: 'Research & Inspiration', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), completed: true, completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
          { title: 'Initial Mockups', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), completed: false },
          { title: 'Final Designs', dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000), completed: false }
        ],
        comments: [
          {
            author: employees[1] ? employees[1].username : employees[0].username,
            authorId: employees[1] ? employees[1]._id : employees[0]._id,
            role: 'employee',
            message: 'Completed research phase, starting mockups',
            type: 'update'
          }
        ],
        assignedBy: hrUser._id,
        assignedByName: hrUser.username,
        assignedByRole: hrUser.role
      }
    ];

    // Create tasks
    const createdTasks = await Task.insertMany(sampleTasks);
    console.log(`\n✅ Successfully created ${createdTasks.length} sample tasks:`);
    
    createdTasks.forEach((task, index) => {
      console.log(`\n${index + 1}. ${task.title}`);
      console.log(`   Employee: ${task.employeeName}`);
      console.log(`   Status: ${task.status}`);
      console.log(`   Priority: ${task.priority}`);
      console.log(`   Due Date: ${task.dueDate.toLocaleDateString()}`);
    });

    console.log('\n✅ Sample tasks created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample tasks:', error);
    process.exit(1);
  }
};

createSampleTasks();
