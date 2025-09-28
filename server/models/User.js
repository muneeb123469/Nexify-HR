const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['hr', 'applicant', 'employee'],
    default: 'applicant'
  },
  // Employee-specific fields
  employeeId: {
    type: String,
    unique: true,
    sparse: true // Only required for employees
  },
  department: {
    type: String,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
  // Employee Classification fields
  category: {
    type: String,
    enum: ['Technical', 'Administrative', 'Management', 'Support'],
    trim: true
  },
  level: {
    type: String,
    enum: ['Junior', 'Mid-level', 'Senior', 'Manager', 'Director'],
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  projects: [{
    type: String,
    trim: true
  }],
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  emergencyContacts: [{
    name: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Terminated'],
    default: 'Active'
  },
  hireDate: {
    type: Date
  },
  salary: {
    type: Number
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Existing fields
  isPending: {
    type: Boolean,
    default: false
  },
  approved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Generate employee ID for new employees
userSchema.pre('save', async function(next) {
  if (this.role === 'employee' && !this.employeeId) {
    try {
      // Find the highest existing employee ID number
      const lastEmployee = await mongoose.model('User').findOne(
        { 
          role: 'employee',
          employeeId: { $exists: true, $ne: null }
        },
        { employeeId: 1 }
      ).sort({ employeeId: -1 });

      let nextNumber = 1;
      if (lastEmployee && lastEmployee.employeeId) {
        // Extract number from employeeId (e.g., "EMP003" -> 3)
        const lastNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''));
        nextNumber = lastNumber + 1;
      }

      // Keep trying until we find an available ID
      let attempts = 0;
      const maxAttempts = 1000; // Prevent infinite loop
      
      while (attempts < maxAttempts) {
        const candidateId = `EMP${String(nextNumber).padStart(3, '0')}`;
        
        // Check if this ID already exists
        const existingEmployee = await mongoose.model('User').findOne({ employeeId: candidateId });
        
        if (!existingEmployee) {
          this.employeeId = candidateId;
          break;
        }
        
        nextNumber++;
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique employee ID');
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to compare passwords (direct string comparison for testing)
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('Comparing passwords...');
    const isMatch = candidatePassword === this.password;
    console.log('Password comparison result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

// Method to get user data without password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Export the model with safety check to prevent overwrite errors
module.exports = mongoose.models.User || mongoose.model('User', userSchema);