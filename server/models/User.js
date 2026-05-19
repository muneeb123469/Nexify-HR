const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BCRYPT_SALT_ROUNDS = 10;
const BCRYPT_HASH_PREFIX = /^\$2[aby]\$/;

const isBcryptHash = (password) => (
  typeof password === 'string' && BCRYPT_HASH_PREFIX.test(password)
);

const hashPassword = (password) => bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

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
    enum: ['hr', 'applicant', 'employee', 'admin'],
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
  employeeStatus: {
    type: String,
    enum: ['Full-time permanent employee', 'Part-time employee', 'Contract-based employee', 'Intern'],
    required: function () {
      return this.role === 'employee';
    }
  },
  hireDate: {
    type: Date
  },
  salary: {
    type: Number
  },
  // Salary adjustments made by HR (manual overrides)
  salaryAdjustments: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Work Mode for HR Performance Model
  workMode: {
    type: String,
    enum: ['Online', 'Hybrid', 'Office'],
    default: 'Office'
  },
  // Job History for YearsInRole calculation
  jobHistory: [{
    jobTitle: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      default: null // null means current role
    },
    department: {
      type: String
    }
  }],
  // Additional fields needed for HR Performance Model
  attendanceRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 1 // Stored as decimal (0.85 = 85%)
  },
  onTimeRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 1 // Stored as decimal (0.90 = 90%)
  },
  avgLateMinutes: {
    type: Number,
    default: 0,
    min: 0
  },
  avgWorkHours: {
    type: Number,
    default: 8,
    min: 0
  },
  monthlyHoursWorked: {
    type: Number,
    default: 0,
    min: 0
  },
  taskQualityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  peerReviewScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  managerRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  trainingHoursCompleted: {
    type: Number,
    default: 0,
    min: 0
  },
  promotionsLast3Years: {
    type: Number,
    default: 0,
    min: 0
  },
  disciplinaryActions: {
    type: Number,
    default: 0,
    min: 0
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

// Hash new or changed passwords unless they are already bcrypt hashes
userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password') && this.password && !isBcryptHash(this.password)) {
      this.password = await hashPassword(this.password);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update updatedAt and job history
userSchema.pre('save', function (next) {
  this.updatedAt = new Date();

  // If jobTitle changed and this is an employee, update job history
  if (this.role === 'employee' && this.isModified('jobTitle') && this.jobTitle) {
    // End the current role if exists
    if (this.jobHistory && this.jobHistory.length > 0) {
      const currentRole = this.jobHistory.find(job => !job.endDate);
      if (currentRole && currentRole.jobTitle !== this.jobTitle) {
        currentRole.endDate = new Date();
      }
    }

    // Add new role if it's different from the last one
    const lastJob = this.jobHistory && this.jobHistory.length > 0
      ? this.jobHistory[this.jobHistory.length - 1]
      : null;

    if (!lastJob || lastJob.jobTitle !== this.jobTitle) {
      if (!this.jobHistory) this.jobHistory = [];
      this.jobHistory.push({
        jobTitle: this.jobTitle,
        startDate: new Date(),
        department: this.department
      });
    }
  }

  next();
});

// Generate employee ID for new employees
userSchema.pre('save', async function (next) {
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

userSchema.statics.isBcryptHash = isBcryptHash;
userSchema.statics.hashPassword = hashPassword;

userSchema.methods.hasBcryptPassword = function () {
  return isBcryptHash(this.password);
};

userSchema.methods.needsPasswordUpgrade = function () {
  return Boolean(this.password && !this.hasBcryptPassword());
};

// Method to compare passwords with bcrypt and legacy plain-text fallback
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    if (this.hasBcryptPassword()) {
      return bcrypt.compare(candidatePassword, this.password);
    }

    return candidatePassword === this.password;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

// Method to calculate years in company
userSchema.methods.getYearsInCompany = function () {
  if (!this.hireDate) return 0;
  const diffTime = Math.abs(new Date() - this.hireDate);
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return Math.round(diffYears * 100) / 100; // Round to 2 decimal places
};

// Method to calculate years in current role
userSchema.methods.getYearsInRole = function () {
  if (!this.jobHistory || this.jobHistory.length === 0) {
    return this.getYearsInCompany(); // Fallback to company years if no job history
  }

  const currentRole = this.jobHistory.find(job => !job.endDate);
  if (!currentRole) return 0;

  const diffTime = Math.abs(new Date() - currentRole.startDate);
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return Math.round(diffYears * 100) / 100; // Round to 2 decimal places
};

// Method to get salary band
userSchema.methods.getSalaryBand = function () {
  if (!this.salary) return 'Low';
  if (this.salary < 50000) return 'Low';
  if (this.salary >= 50000 && this.salary < 100000) return 'Medium';
  return 'High';
};

// Method to get user data without password
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Export the model with safety check to prevent overwrite errors
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
