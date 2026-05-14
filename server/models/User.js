const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

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
  isPending: {
    type: Boolean,
    default: false
  },
  approved: {
    type: Boolean,
    default: function() {
      return this.role !== 'hr';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    return next();
  } catch (error) {
    return next(error);
  }
});

// Method to compare hashed passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
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
