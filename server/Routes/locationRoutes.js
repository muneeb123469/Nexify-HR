const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const { auth, authorize } = require('../middleware/auth');

// Get all active locations
router.get('/', auth, async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      locations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch locations'
    });
  }
});

// Get location by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    
    res.json({
      success: true,
      location
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location'
    });
  }
});

// Create new location (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, latitude, longitude, radius, address } = req.body;
    
    // Validate required fields
    if (!name || !latitude || !longitude || !radius) {
      return res.status(400).json({
        success: false,
        message: 'Name, latitude, longitude, and radius are required'
      });
    }
    
    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90'
      });
    }
    
    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180'
      });
    }
    
    if (radius < 1 || radius > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Radius must be between 1 and 10000 meters'
      });
    }
    
    // Check if location with same name already exists
    const existingLocation = await Location.findOne({ 
      name: name.trim(), 
      isActive: true 
    });
    
    if (existingLocation) {
      return res.status(400).json({
        success: false,
        message: 'A location with this name already exists'
      });
    }
    
    const location = new Location({
      name: name.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseInt(radius),
      address: address?.trim() || '',
      createdBy: req.user._id
    });
    
    await location.save();
    await location.populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      location
    });
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create location'
    });
  }
});

// Update location (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, latitude, longitude, radius, address, isActive } = req.body;
    
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    
    // Validate coordinates if provided
    if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90'
      });
    }
    
    if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
      return res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180'
      });
    }
    
    if (radius !== undefined && (radius < 1 || radius > 10000)) {
      return res.status(400).json({
        success: false,
        message: 'Radius must be between 1 and 10000 meters'
      });
    }
    
    // Check if new name conflicts with existing location
    if (name && name.trim() !== location.name) {
      const existingLocation = await Location.findOne({ 
        name: name.trim(), 
        isActive: true,
        _id: { $ne: req.params.id }
      });
      
      if (existingLocation) {
        return res.status(400).json({
          success: false,
          message: 'A location with this name already exists'
        });
      }
    }
    
    // Update fields
    if (name !== undefined) location.name = name.trim();
    if (latitude !== undefined) location.latitude = parseFloat(latitude);
    if (longitude !== undefined) location.longitude = parseFloat(longitude);
    if (radius !== undefined) location.radius = parseInt(radius);
    if (address !== undefined) location.address = address.trim();
    if (isActive !== undefined) location.isActive = Boolean(isActive);
    
    await location.save();
    await location.populate('createdBy', 'name email');
    
    res.json({
      success: true,
      message: 'Location updated successfully',
      location
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location'
    });
  }
});

// Delete location (Admin only) - Soft delete
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    
    location.isActive = false;
    await location.save();
    
    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete location'
    });
  }
});

// Check if user is within any approved location
router.post('/validate', auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }
    
    const locations = await Location.find({ isActive: true });
    
    // Check each location to see if user is within radius
    const validLocations = locations.filter(location => {
      return location.isWithinRadius(parseFloat(latitude), parseFloat(longitude));
    });
    
    if (validLocations.length > 0) {
      res.json({
        success: true,
        isValid: true,
        message: 'Location is valid for attendance',
        matchedLocations: validLocations.map(loc => ({
          id: loc._id,
          name: loc.name,
          distance: Math.round(loc.calculateDistance(parseFloat(latitude), parseFloat(longitude)))
        }))
      });
    } else {
      // Find nearest location for helpful error message
      let nearestLocation = null;
      let nearestDistance = Infinity;
      
      locations.forEach(location => {
        const distance = location.calculateDistance(parseFloat(latitude), parseFloat(longitude));
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestLocation = location;
        }
      });
      
      res.json({
        success: true,
        isValid: false,
        message: 'You are not within any approved location for attendance',
        nearestLocation: nearestLocation ? {
          name: nearestLocation.name,
          distance: Math.round(nearestDistance),
          requiredRadius: nearestLocation.radius
        } : null
      });
    }
  } catch (error) {
    console.error('Error validating location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate location'
    });
  }
});

// Debug endpoint - Get detailed location info
router.post('/debug', auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);

    // Get all active locations
    const locations = await Location.find({ isActive: true });
    
    const locationDetails = locations.map(location => {
      const distance = location.calculateDistance(userLat, userLng);
      const isWithin = location.isWithinRadius(userLat, userLng);
      
      return {
        name: location.name,
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        radius: location.radius,
        distance: Math.round(distance),
        isWithinRadius: isWithin,
        address: location.address
      };
    });

    res.json({
      success: true,
      userLocation: { latitude: userLat, longitude: userLng },
      locations: locationDetails,
      summary: {
        totalLocations: locations.length,
        validLocations: locationDetails.filter(l => l.isWithinRadius).length
      }
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to debug location'
    });
  }
});

// Get nearby locations (for debugging/info)
router.post('/nearby', auth, async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const locations = await Location.find({ isActive: true });
    
    const nearbyLocations = locations.map(location => {
      const distance = location.calculateDistance(parseFloat(latitude), parseFloat(longitude));
      return {
        id: location._id,
        name: location.name,
        address: location.address,
        distance: Math.round(distance),
        radius: location.radius,
        isWithinRadius: distance <= location.radius
      };
    }).filter(loc => loc.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
    
    res.json({
      success: true,
      nearbyLocations
    });
  } catch (error) {
    console.error('Error finding nearby locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find nearby locations'
    });
  }
});

module.exports = router;
