const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  radius: {
    type: Number,
    required: true,
    min: 1,
    max: 10000, // Maximum 10km radius
    default: 100 // Default 100 meters
  },
  address: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Update the updatedAt field before saving
locationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for geospatial queries
locationSchema.index({ latitude: 1, longitude: 1 });

// Method to calculate distance between two points using Haversine formula
locationSchema.methods.calculateDistance = function(lat, lng) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat - this.latitude) * Math.PI / 180;
  const dLng = (lng - this.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in meters
};

// Method to check if a point is within the location's radius
locationSchema.methods.isWithinRadius = function(lat, lng) {
  const distance = this.calculateDistance(lat, lng);
  return distance <= this.radius;
};

// Static method to find locations within range of a point
locationSchema.statics.findNearby = function(lat, lng, maxDistance = 1000) {
  return this.find({ isActive: true }).then(locations => {
    return locations.filter(location => {
      const distance = location.calculateDistance(lat, lng);
      return distance <= maxDistance;
    });
  });
};

module.exports = mongoose.model('Location', locationSchema);
