const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  employeeEmail: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: () => {
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }
  },
  sessions: [{
    checkInAt: {
      type: Date,
      required: true
    },
    checkOutAt: {
      type: Date,
      default: null
    }
  }],
  status: {
    type: String,
    enum: ['checked-in', 'checked-out', 'completed'],
    default: 'checked-in'
  },
  workingHours: {
    type: String, // formatted as "HH:MM"
    default: "0:00"
  },
  totalWorkingMinutes: {
    type: Number, // total minutes for calculations
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ employeeId: 1 });

// Calculate total working hours from all completed sessions
attendanceSchema.methods.calculateWorkingHours = function() {
  let totalMinutes = 0;
  const sessions = this.sessions || [];
  
  // Calculate working time for each completed session
  const completedSessions = sessions.filter(session => session.checkInAt && session.checkOutAt);
  
  for (const session of completedSessions) {
    const diffInMs = session.checkOutAt - session.checkInAt;
    totalMinutes += Math.floor(diffInMs / (1000 * 60));
  }
  
  this.totalWorkingMinutes = totalMinutes;
  
  // Format working hours as "HH:MM"
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  this.workingHours = `${hours}:${String(minutes).padStart(2, '0')}`;
  
  // Update status based on current state
  const hasActiveSession = sessions.some(session => session.checkInAt && !session.checkOutAt);
  
  if (hasActiveSession) {
    this.status = 'checked-in';
  } else if (sessions.length > 0) {
    this.status = 'completed';
  } else {
    this.status = 'checked-out';
  }
  
  return this.workingHours;
};

// Get current session info
attendanceSchema.methods.getCurrentSession = function() {
  const sessions = this.sessions || [];
  const activeSession = sessions.find(session => session.checkInAt && !session.checkOutAt);
  const completedSessions = sessions.filter(session => session.checkInAt && session.checkOutAt);
  const lastSession = sessions[sessions.length - 1];
  
  return {
    isCurrentlyCheckedIn: !!activeSession,
    totalSessions: sessions.length,
    completedSessions: completedSessions.length,
    activeSession: activeSession || null,
    lastCheckIn: activeSession ? activeSession.checkInAt : (lastSession?.checkInAt || null),
    lastCheckOut: lastSession?.checkOutAt || null,
    sessions: sessions
  };
};

// Check if employee can check in (not currently checked in)
attendanceSchema.methods.canCheckIn = function() {
  const sessions = this.sessions || [];
  return !sessions.some(session => session.checkInAt && !session.checkOutAt);
};

// Check if employee can check out (currently checked in)
attendanceSchema.methods.canCheckOut = function() {
  const sessions = this.sessions || [];
  return sessions.some(session => session.checkInAt && !session.checkOutAt);
};

// Virtual for formatted working hours (for display)
attendanceSchema.virtual('formattedWorkingHours').get(function() {
  if (!this.workingHours || this.workingHours === "0:00") {
    return "0h 0m";
  }
  
  const [hours, minutes] = this.workingHours.split(':');
  return `${hours}h ${minutes}m`;
});

// Ensure virtual fields are serialized
attendanceSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
