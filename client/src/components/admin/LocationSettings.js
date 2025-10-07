import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Navigation,
  AlertCircle,
  CheckCircle,
  Search,
  Target
} from 'lucide-react';
import { AdminSideBar } from '../dashboard/AdminDashboard';

// LocationModal component - defined outside to prevent re-creation on each render
const LocationModal = ({ 
  isEdit = false, 
  formData, 
  setFormData, 
  searchAddress, 
  setSearchAddress,
  gettingLocation,
  handleSubmit,
  searchLocation,
  getCurrentLocation,
  setShowAddModal,
  setShowEditModal,
  resetForm
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-[#2C3E50]">
          {isEdit ? 'Edit Location' : 'Add New Location'}
        </h3>
        <button
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            resetForm();
          }}
          className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Name */}
        <div>
          <label className="block text-sm font-medium text-[#2C3E50] mb-2">
            Location Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., HQ Islamabad"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9F9F] focus:border-[#4C9F9F] transition-colors duration-200"
            required
          />
        </div>

        {/* Address Search */}
        <div>
          <label className="block text-sm font-medium text-[#2C3E50] mb-2">
            Search Address
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Enter address to search"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9F9F] focus:border-[#4C9F9F] transition-colors duration-200"
            />
            <button
              type="button"
              onClick={searchLocation}
              className="px-6 py-3 bg-[#4C9F9F] text-white rounded-lg hover:bg-[#2A6F6F] flex items-center gap-2 font-medium transition-colors duration-200"
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </div>

        {/* Current Location Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="px-6 py-3 bg-[#4C9F9F] text-white rounded-lg hover:bg-[#2A6F6F] flex items-center gap-2 font-medium disabled:opacity-50 transition-colors duration-200"
          >
            <Navigation size={16} />
            {gettingLocation ? 'Getting Location...' : 'Use My Current Location'}
          </button>
        </div>

        {/* Manual Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2C3E50] mb-2">
              Latitude *
            </label>
            <input
              type="number"
              step="0.000001"
              value={formData.latitude}
              onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
              placeholder="e.g., 33.6844"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9F9F] focus:border-[#4C9F9F] transition-colors duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C3E50] mb-2">
              Longitude *
            </label>
            <input
              type="number"
              step="0.000001"
              value={formData.longitude}
              onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
              placeholder="e.g., 73.0479"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9F9F] focus:border-[#4C9F9F] transition-colors duration-200"
              required
            />
          </div>
        </div>

        {/* Radius */}
        <div>
          <label className="block text-sm font-medium text-[#2C3E50] mb-2">
            Radius (meters) *
          </label>
          <input
            type="number"
            min="1"
            max="10000"
            value={formData.radius}
            onChange={(e) => setFormData(prev => ({ ...prev, radius: parseInt(e.target.value) || 100 }))}
            placeholder="100"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9F9F] focus:border-[#4C9F9F] transition-colors duration-200"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Recommended: 100-150 meters for office buildings
          </p>
        </div>

        {/* Address (Optional) */}
        <div>
          <label className="block text-sm font-medium text-[#2C3E50] mb-2">
            Address (Optional)
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Full address for reference"
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9F9F] focus:border-[#4C9F9F] transition-colors duration-200"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              resetForm();
            }}
            className="px-6 py-3 text-[#2C3E50] bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-[#4C9F9F] text-white rounded-lg hover:bg-[#2A6F6F] flex items-center gap-2 font-medium transition-colors duration-200"
          >
            <Save size={16} />
            {isEdit ? 'Update Location' : 'Save Location'}
          </button>
        </div>
      </form>
    </div>
  </div>
);


const LocationSettings = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: 100,
    address: ''
  });

  // Map and location state
  const [currentLocation, setCurrentLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/locations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setLocations(data.locations);
      } else {
        showMessage('error', 'Failed to fetch locations');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      showMessage('error', 'Error fetching locations');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      latitude: '',
      longitude: '',
      radius: 100,
      address: ''
    });
    setSearchAddress('');
  };

  const handleAddLocation = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditLocation = (location) => {
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      radius: location.radius,
      address: location.address || ''
    });
    setShowEditModal(true);
  };

  const updateLocationToCurrentPosition = async (location) => {
    if (!window.confirm(`Update "${location.name}" to your current location?`)) {
      return;
    }

    try {
      setGettingLocation(true);
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/locations/${location._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: location.name,
          latitude: latitude,
          longitude: longitude,
          radius: location.radius,
          address: location.address || ''
        })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', `Location "${location.name}" updated to your current position`);
        fetchLocations();
      } else {
        showMessage('error', data.message || 'Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      showMessage('error', 'Unable to get your current location or update the location');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm('Are you sure you want to delete this location?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Location deleted successfully');
        fetchLocations();
      } else {
        showMessage('error', data.message || 'Failed to delete location');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      showMessage('error', 'Error deleting location');
    }
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    
    if (!navigator.geolocation) {
      showMessage('error', 'Geolocation is not supported by this browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6)
        }));
        setCurrentLocation({ latitude, longitude });
        showMessage('success', 'Current location obtained successfully');
        setGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        showMessage('error', 'Unable to get your current location. Please check your browser permissions.');
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const searchLocation = async () => {
    if (!searchAddress.trim()) {
      showMessage('error', 'Please enter an address to search');
      return;
    }

    try {
      // Using a simple geocoding approach with OpenStreetMap Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(result.lat).toFixed(6),
          longitude: parseFloat(result.lon).toFixed(6),
          address: result.display_name
        }));
        showMessage('success', 'Location found successfully');
      } else {
        showMessage('error', 'Location not found. Please try a different address.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      showMessage('error', 'Error searching for location');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.latitude || !formData.longitude || !formData.radius) {
      showMessage('error', 'Please fill in all required fields');
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    const radius = parseInt(formData.radius);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      showMessage('error', 'Please enter a valid latitude (-90 to 90)');
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      showMessage('error', 'Please enter a valid longitude (-180 to 180)');
      return;
    }

    if (isNaN(radius) || radius < 1 || radius > 10000) {
      showMessage('error', 'Please enter a valid radius (1 to 10000 meters)');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = showEditModal ? `/api/locations/${selectedLocation._id}` : '/api/locations';
      const method = showEditModal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          latitude: lat,
          longitude: lng,
          radius: radius,
          address: formData.address.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', showEditModal ? 'Location updated successfully' : 'Location created successfully');
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        fetchLocations();
      } else {
        showMessage('error', data.message || 'Failed to save location');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      showMessage('error', 'Error saving location');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8F9FA]">
        <AdminSideBar />
        <main className="flex-1 overflow-auto">
          <header className="bg-gradient-to-r from-[#A5D8D0] to-[#2C3E50] shadow-sm p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Location Settings</h1>
                <p className="text-white/80">Manage approved locations for employee attendance</p>
              </div>
            </div>
          </header>
          <div className="p-4 lg:p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-[#4C9F9F] text-lg">Loading locations...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      <AdminSideBar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#A5D8D0] to-[#2C3E50] shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Location Settings</h1>
              <p className="text-white/80">Manage approved locations for employee attendance</p>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="p-4 lg:p-6">

          {/* Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {message.text}
            </div>
          )}

          {/* Add Location Button */}
          <div className="mb-6">
            <button
              onClick={handleAddLocation}
              className="bg-[#4C9F9F] text-white px-6 py-3 rounded-lg hover:bg-[#2A6F6F] flex items-center gap-2 font-medium transition-colors duration-200"
            >
              <Plus size={20} />
              Add Location
            </button>
          </div>

          {/* Locations List */}
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-[#2C3E50]">Approved Locations</h2>
            </div>
          
            {locations.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <MapPin size={64} className="mx-auto mb-6 text-gray-300" />
                <h3 className="text-lg font-medium text-[#2C3E50] mb-2">No locations configured yet</h3>
                <p className="text-gray-600">Add your first approved location to enable location-based attendance</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {locations.map((location) => (
                  <div key={location._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-[#4C9F9F]/10 rounded-lg">
                            <MapPin size={20} className="text-[#4C9F9F]" />
                          </div>
                          <h3 className="text-lg font-semibold text-[#2C3E50]">{location.name}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#2C3E50]">Coordinates:</span>
                            <span>{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#2C3E50]">Radius:</span>
                            <span>{location.radius} meters</span>
                          </div>
                          {location.address && (
                            <div className="md:col-span-2 flex items-start gap-2">
                              <span className="font-medium text-[#2C3E50]">Address:</span>
                              <span className="flex-1">{location.address}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#2C3E50]">Created:</span>
                            <span>{new Date(location.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditLocation(location)}
                          className="p-2 text-[#4C9F9F] hover:bg-[#4C9F9F] hover:text-white rounded-lg transition-colors duration-200"
                          title="Edit Location"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => updateLocationToCurrentPosition(location)}
                          className="p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors duration-200"
                          title="Update to Current Location"
                        >
                          <Target size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(location._id)}
                          className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors duration-200"
                          title="Delete Location"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modals */}
          {showAddModal && (
            <LocationModal 
              isEdit={false}
              formData={formData}
              setFormData={setFormData}
              searchAddress={searchAddress}
              setSearchAddress={setSearchAddress}
              gettingLocation={gettingLocation}
              handleSubmit={handleSubmit}
              searchLocation={searchLocation}
              getCurrentLocation={getCurrentLocation}
              setShowAddModal={setShowAddModal}
              setShowEditModal={setShowEditModal}
              resetForm={resetForm}
            />
          )}
          {showEditModal && (
            <LocationModal 
              isEdit={true}
              formData={formData}
              setFormData={setFormData}
              searchAddress={searchAddress}
              setSearchAddress={setSearchAddress}
              gettingLocation={gettingLocation}
              handleSubmit={handleSubmit}
              searchLocation={searchLocation}
              getCurrentLocation={getCurrentLocation}
              setShowAddModal={setShowAddModal}
              setShowEditModal={setShowEditModal}
              resetForm={resetForm}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default LocationSettings;