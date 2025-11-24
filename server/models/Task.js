const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedDate: {
    type: Date
  }
});

const commentSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['instruction', 'feedback', 'update', 'urgent'],
    default: 'update'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const attachmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const taskSchema = new mongoose.Schema({
  // Employee Information
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  employeeName: {
    type: String,
    required: true
  },
  employeeEmail: {
    type: String,
    required: true
  },
  employeeDepartment: {
    type: String,
    required: true
  },

  // Task Details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    required: true,
    default: 'medium'
  },
  category: {
    type: String,
    required: true,
    enum: ['development', 'marketing', 'sales', 'admin', 'support', 'design', 'reporting', 'documentation', 'training', 'technical', 'other']
  },
  taskType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'project-based'],
    required: true,
    default: 'daily'
  },

  // Timeline
  assignedDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  estimatedHours: {
    type: Number,
    required: true,
    min: 0
  },
  completedDate: {
    type: Date
  },

  // Status and Progress
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'overdue'],
    default: 'pending',
    index: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Milestones
  milestones: [milestoneSchema],

  // Comments and Communication
  comments: [commentSchema],

  // Attachments
  attachments: [attachmentSchema],

  // Assignment Information
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedByName: {
    type: String,
    required: true
  },
  assignedByRole: {
    type: String,
    required: true
  },

  // Additional Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String
  },

  // Performance Points
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  pointsAssignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pointsAssignedDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
taskSchema.index({ employeeId: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ createdAt: -1 });

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed') return false;
  return new Date() > this.dueDate;
});

// Method to update task status based on due date
taskSchema.methods.updateOverdueStatus = function() {
  if (this.status !== 'completed' && new Date() > this.dueDate) {
    this.status = 'overdue';
  }
  return this;
};

// Method to calculate progress based on milestones
taskSchema.methods.calculateProgress = function() {
  if (this.milestones.length === 0) return this.progress;
  
  const completedMilestones = this.milestones.filter(m => m.completed).length;
  const totalMilestones = this.milestones.length;
  
  this.progress = Math.round((completedMilestones / totalMilestones) * 100);
  return this.progress;
};

// Method to add comment
taskSchema.methods.addComment = function(commentData) {
  this.comments.push(commentData);
  return this.save();
};

// Method to update milestone status
taskSchema.methods.updateMilestone = function(milestoneId, completed) {
  const milestone = this.milestones.id(milestoneId);
  if (milestone) {
    milestone.completed = completed;
    if (completed) {
      milestone.completedDate = new Date();
    } else {
      milestone.completedDate = undefined;
    }
    this.calculateProgress();
  }
  return this.save();
};

// Pre-save middleware to update overdue status
taskSchema.pre('save', function(next) {
  this.updateOverdueStatus();
  next();
});

// Static method to get tasks by employee
taskSchema.statics.getTasksByEmployee = function(employeeId, filters = {}) {
  const query = { employeeId, isActive: true };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get tasks by HR/Admin
taskSchema.statics.getTasksByAssigner = function(assignerId, filters = {}) {
  const query = { assignedBy: assignerId, isActive: true };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.employeeId) {
    query.employeeId = filters.employeeId;
  }
  
  return this.find(query)
    .populate('employeeId', 'name email department')
    .sort({ createdAt: -1 });
};

// Static method to get task statistics for an employee
taskSchema.statics.getEmployeeStats = async function(employeeId) {
  const tasks = await this.find({ employeeId, isActive: true });
  
  return {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    completionRate: tasks.length > 0 
      ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) 
      : 0
  };
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
