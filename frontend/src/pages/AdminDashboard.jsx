// Importing React hooks, axios for API calls, and toast for notifications
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// AdminDashboard component - allows admin to manage bikes (CRUD operations)
const AdminDashboard = () => {
  // State to store list of bikes from database
  const [bikes, setBikes] = useState([]);
  
  // State to store pending rentals
  const [pendingRentals, setPendingRentals] = useState([]);
  
  // State to store active rentals
  const [activeRentals, setActiveRentals] = useState([]);
  
  // State to store users list
  const [users, setUsers] = useState([]);
  
  // State to control which tab is active
  const [activeTab, setActiveTab] = useState('bikes');
  
  // State for user details modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // State to control whether add/edit form is visible
  const [showForm, setShowForm] = useState(false);
  
  // State to store bike being edited (null if adding new bike)
  const [editingBike, setEditingBike] = useState(null);
  
  // State to store form input values
  const [formData, setFormData] = useState({
    name: '',           // Bike name
    type: '',           // Bike type (Mountain, Road, etc.)
    types: [],          // Multiple bike types array
    price_per_hour: '', // Rental price per hour
    description: '',    // Bike description
    image_url: '',      // URL for bike image
    available: true     // Availability status (default: available)
  });

  // Fetch bikes when component mounts (page loads)
  useEffect(() => {
    fetchBikes();
    fetchPendingRentals();
    fetchActiveRentals();
    fetchUsers();
  }, []);

  // Function to get all bikes from backend API
  const fetchBikes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bikes');
      setBikes(res.data); // Update bikes state with fetched data
    } catch (err) {
      toast.error('Failed to fetch bikes'); // Show error notification
    }
  };

  // Function to get pending rentals
  const fetchPendingRentals = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/rentals');
      setPendingRentals(res.data.filter(rental => rental.status === 'pending'));
    } catch (err) {
      toast.error('Failed to fetch rentals');
    }
  };

  // Function to get active rentals
  const fetchActiveRentals = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/rentals');
      setActiveRentals(res.data.filter(rental => rental.status === 'confirmed' && !rental.return_date));
    } catch (err) {
      toast.error('Failed to fetch active rentals');
    }
  };

  // Function to get all users
  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const res = await axios.get('http://localhost:5000/api/users');
      console.log('Users fetched:', res.data);
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to fetch users: ' + (err.response?.data?.message || err.message));
    }
  };

  // Function to confirm rental
  const handleConfirmRental = async (rentalId) => {
    try {
      console.log('Confirming rental:', rentalId);
      
      // Try different endpoint patterns
      let response;
      try {
        // Try POST with confirm action
        response = await axios.post(`http://localhost:5000/api/rentals/${rentalId}/confirm`);
      } catch (err1) {
        try {
          // Try PUT with confirm action
          response = await axios.put(`http://localhost:5000/api/rentals/${rentalId}/confirm`);
        } catch (err2) {
          try {
            // Try PATCH with status update
            response = await axios.patch(`http://localhost:5000/api/rentals/${rentalId}`, { status: 'confirmed' });
          } catch (err3) {
            // Try PUT with status update
            response = await axios.put(`http://localhost:5000/api/rentals/${rentalId}`, { status: 'confirmed' });
          }
        }
      }
      
      console.log('Confirmation response:', response);
      toast.success('Rental confirmed successfully');
      fetchPendingRentals();
      fetchActiveRentals();
      fetchBikes();
    } catch (err) {
      console.error('Confirmation error:', err.response?.data || err.message);
      toast.error(`Failed to confirm rental: ${err.response?.data?.message || err.message}`);
    }
  };

  // Function to reject rental
  const handleRejectRental = async (rentalId) => {
    try {
      console.log('Rejecting rental:', rentalId);
      
      // Try different endpoint patterns
      let response;
      try {
        // Try POST with reject action
        response = await axios.post(`http://localhost:5000/api/rentals/${rentalId}/reject`);
      } catch (err1) {
        try {
          // Try PUT with reject action
          response = await axios.put(`http://localhost:5000/api/rentals/${rentalId}/reject`);
        } catch (err2) {
          try {
            // Try PATCH with status update
            response = await axios.patch(`http://localhost:5000/api/rentals/${rentalId}`, { status: 'rejected' });
          } catch (err3) {
            // Try PUT with status update
            response = await axios.put(`http://localhost:5000/api/rentals/${rentalId}`, { status: 'rejected' });
          }
        }
      }
      
      console.log('Rejection response:', response);
      toast.success('Rental rejected');
      fetchPendingRentals();
      fetchBikes();
    } catch (err) {
      console.error('Rejection error:', err.response?.data || err.message);
      toast.error(`Failed to reject rental: ${err.response?.data?.message || err.message}`);
    }
  };

  // Function to return bike
  const handleReturnBike = async (rentalId) => {
    try {
      console.log('Returning bike for rental:', rentalId);
      
      // Try different endpoint patterns
      let response;
      try {
        // Try POST with return action
        response = await axios.post(`http://localhost:5000/api/rentals/${rentalId}/return`);
      } catch (err1) {
        try {
          // Try PUT with return action
          response = await axios.put(`http://localhost:5000/api/rentals/${rentalId}/return`);
        } catch (err2) {
          try {
            // Try PATCH with status and return_date
            response = await axios.patch(`http://localhost:5000/api/rentals/${rentalId}`, { 
              status: 'returned',
              return_date: new Date().toISOString()
            });
          } catch (err3) {
            try {
              // Try PUT with status and return_date
              response = await axios.put(`http://localhost:5000/api/rentals/${rentalId}`, { 
                status: 'returned',
                return_date: new Date().toISOString()
              });
            } catch (err4) {
              // Try simple POST with return action (no ID in path)
              response = await axios.post(`http://localhost:5000/api/rentals/return`, { rental_id: rentalId });
            }
          }
        }
      }
      
      console.log('Return response:', response);
      toast.success('Bike returned successfully');
      fetchActiveRentals();
      fetchBikes();
    } catch (err) {
      console.error('Return error:', err.response?.data || err.message);
      toast.error(`Failed to return bike: ${err.response?.data?.message || err.message}`);
    }
  };

  // Function to show user details
  const showUserDetails = async (userId, userName, userEmail) => {
    try {
      // Get all rentals and filter by user_id
      const res = await axios.get('http://localhost:5000/api/rentals');
      const userRentals = res.data.filter(rental => rental.user_id === userId);
      setSelectedUser({
        id: userId,
        name: userName,
        email: userEmail,
        rentals: userRentals
      });
      setShowUserModal(true);
    } catch (err) {
      toast.error('Failed to fetch user details');
    }
  };

  // Function to handle form submission (add or update bike)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh
    
    try {
      // Prepare data for backend - convert types array to string for compatibility
      const submitData = {
        name: formData.name || '',
        type: (formData.types && formData.types.length > 0) ? formData.types.join(', ') : '',
        price_per_hour: parseFloat(formData.price_per_hour) || 0,
        description: formData.description || '',
        image_url: formData.image_url || '',
        available: formData.available !== false
      };
      
      // Validate required fields
      if (!submitData.name || !submitData.type || !submitData.price_per_hour) {
        toast.error('Please fill in all required fields and select at least one bike type');
        return;
      }
      
      // Ensure image_url is a string (empty if not provided)
      if (!submitData.image_url) {
        submitData.image_url = '';
      }
      
      console.log('Submitting data:', { ...submitData, image_url: submitData.image_url ? 'base64_data_present' : 'no_image' });
      
      if (editingBike) {
        // If editing existing bike, send PUT request to update
        await axios.put(`http://localhost:5000/api/bikes/${editingBike.id}`, submitData);
        toast.success('Bike updated successfully');
      } else {
        // If adding new bike, send POST request to create
        await axios.post('http://localhost:5000/api/bikes', submitData);
        toast.success('Bike added successfully');
      }
      resetForm();   // Clear form after successful operation
      fetchBikes();  // Refresh bike list
    } catch (err) {
      console.error('Submit error:', err.response?.data || err.message);
      toast.error('Operation failed: ' + (err.response?.data?.message || err.message)); // Show error notification
    }
  };

  // Function to delete a bike
  const handleDelete = async (id) => {
    // Ask user for confirmation before deleting
    if (window.confirm('Are you sure you want to delete this bike?')) {
      try {
        await axios.delete(`http://localhost:5000/api/bikes/${id}`);
        toast.success('Bike deleted successfully');
        fetchBikes(); // Refresh bike list after deletion
      } catch (err) {
        toast.error('Failed to delete bike');
      }
    }
  };

  // Function to start editing a bike
  const handleEdit = (bike) => {
    setEditingBike(bike);    // Set bike to be edited
    // Convert type string back to types array for editing
    const editData = {
      ...bike,
      types: bike.type ? bike.type.split(', ') : []
    };
    setFormData(editData);   // Fill form with bike data
    setShowForm(true);       // Show the form
  };

  // Function to reset form and close it
  const resetForm = () => {
    // Reset form data to empty values
    setFormData({ name: '', type: '', types: [], price_per_hour: '', description: '', image_url: '', available: true });
    setEditingBike(null);    // Clear editing bike
    setShowForm(false);      // Hide form
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your bike inventory and rentals</p>
          </div>
          {activeTab === 'bikes' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold shadow-md transition"
            >
              {showForm ? 'Cancel' : '+ Add New Bike'}
            </button>
          )}
        </div>

        {/* Tab Navigation - Three main sections for admin management */}
        <div className="flex space-x-1 mb-8">
          {/* Bikes tab - Manage bike inventory */}
          <button
            onClick={() => setActiveTab('bikes')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'bikes' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            🚴 Bikes ({bikes.length})
          </button>
          {/* Pending rentals tab - Approve/reject booking requests */}
          <button
            onClick={() => setActiveTab('rentals')}
            className={`px-6 py-3 rounded-lg font-semibold transition relative ${
              activeTab === 'rentals' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            📋 Pending Rentals ({pendingRentals.length})
            {/* Red notification badge when there are pending requests */}
            {pendingRentals.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {pendingRentals.length}
              </span>
            )}
          </button>
          {/* Active rentals tab - Manage bikes currently rented out */}
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'active' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            🔄 Active Rentals ({activeRentals.length})
          </button>
          {/* Users tab - View all users and admins */}
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            👥 Users ({users.length})
          </button>
        </div>

        {/* Bike Add/Edit Form - Only shown when showForm is true and on bikes tab */}
        {activeTab === 'bikes' && showForm && (
          <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingBike ? 'Edit Bike' : 'Add New Bike'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Bike Name</label>
                <input
                  type="text"
                  placeholder="Mountain Pro X1"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Types (Select Multiple)</label>
                <div className="grid grid-cols-2 gap-2 p-3 border border-gray-300 rounded-lg">
                  {['Off-Road', 'Highway', 'Hybrid', 'Electric', 'Touring'].map(type => (
                    <label key={type} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.types?.includes(type) || false}
                        onChange={(e) => {
                          const types = formData.types || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, types: [...types, type] });
                          } else {
                            setFormData({ ...formData, types: types.filter(t => t !== type) });
                          }
                        }}
                        className="mr-2 w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Price per Hour ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="15.99"
                  value={formData.price_per_hour || ''}
                  onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Upload Bike Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    // Block very large files (real check)
                    if (file.size > 300 * 1024) {
                      toast.error("Image too large (max 300KB)");
                      return;
                    }

                    const reader = new FileReader();

                    reader.onloadend = () => {
                      const base64Image = reader.result;

                      // Safe limit for LONGTEXT
                      if (base64Image.length > 1_000_000) {
                        toast.error("Image still too large after encoding");
                        return;
                      }

                      setFormData({ 
                        ...formData, 
                        image_url: base64Image 
                      });

                      toast.success("Image uploaded successfully");
                    };

                    reader.readAsDataURL(file);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
                
                {formData.image_url && (
                  <div className="mt-2">
                    <img src={formData.image_url} alt="Preview" className="w-20 h-20 object-cover rounded-lg" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  placeholder="Describe the bike features..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  rows="3"
                />
              </div>
              <label className="flex items-center col-span-2">
                <input
                  type="checkbox"
                  checked={formData.available || false}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded mr-3"
                />
                <span className="text-gray-700 font-semibold">Available for Rent</span>
              </label>
              <button type="submit" className="col-span-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold shadow-lg transition">
                {editingBike ? 'Update Bike' : 'Add Bike'}
              </button>
            </form>
          </div>
        )}

        {/* Bikes Table - Display all bikes with CRUD operations */}
        {activeTab === 'bikes' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700 font-bold">Name</th>
                <th className="px-6 py-4 text-left text-gray-700 font-bold">Type</th>
                <th className="px-6 py-4 text-left text-gray-700 font-bold">Price/Hour</th>
                <th className="px-6 py-4 text-left text-gray-700 font-bold">Status</th>
                <th className="px-6 py-4 text-left text-gray-700 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bikes.map((bike) => (
                <tr key={bike.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">{bike.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {bike.type && bike.type.includes(', ') ? (
                      <div className="flex flex-wrap gap-1">
                        {bike.type.split(', ').map(type => (
                          <span key={type} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{type}</span>
                        ))}
                      </div>
                    ) : (
                      bike.type
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-bold">${bike.price_per_hour}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      bike.available && !bike.is_booked ? 'bg-green-100 text-green-700' :
                      bike.is_booked ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {bike.available && !bike.is_booked ? 'Available' :
                       bike.is_booked ? 'Booked' :
                       'Rented'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleEdit(bike)} className="text-blue-600 hover:text-blue-800 font-semibold mr-4 transition">Edit</button>
                    <button onClick={() => handleDelete(bike.id)} className="text-red-600 hover:text-red-800 font-semibold transition">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bikes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No bikes added yet. Add your first bike!</p>
            </div>
          )}
          </div>
        )}

        {/* Pending Rentals Tab - Handle booking approvals/rejections */}
        {activeTab === 'rentals' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Pending Rental Requests</h2>
            </div>
            {pendingRentals.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📋</span>
                <p className="text-gray-500 text-lg">No pending rental requests</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-700 font-bold">Customer</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-bold">Bike</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-bold">Request Date</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRentals.map((rental) => (
                      <tr key={rental.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div 
                            className="cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition"
                            onClick={() => showUserDetails(rental.user_id, rental.user_name, rental.user_email)}
                          >
                            <p className="font-semibold text-blue-600 hover:text-blue-800">{rental.user_name}</p>
                            <p className="text-sm text-gray-500">{rental.user_email}</p>
                            <p className="text-xs text-blue-500 mt-1">Click for details</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {rental.bike_image && (
                              <img 
                                src={rental.bike_image.startsWith('http') ? rental.bike_image : `http://localhost:5000${rental.bike_image}`}
                                alt={rental.bike_name}
                                className="w-12 h-12 rounded-lg object-cover mr-3"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{rental.bike_name}</p>
                              <p className="text-sm text-gray-500">{rental.bike_type} - ${rental.bike_price}/hr</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(rental.rental_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleConfirmRental(rental.id)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold transition"
                            >
                              ✓ Confirm
                            </button>
                            <button
                              onClick={() => handleRejectRental(rental.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold transition"
                            >
                              ✗ Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Active Rentals Tab - Manage bikes currently rented out */}
        {activeTab === 'active' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Active Rentals</h2>
            </div>
            {activeRentals.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🚴</span>
                <p className="text-gray-500 text-lg">No active rentals</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-700 font-bold">Customer</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-bold">Bike</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-bold">Rental Date</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRentals.map((rental) => (
                      <tr key={rental.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div 
                            className="cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition"
                            onClick={() => showUserDetails(rental.user_id, rental.user_name, rental.user_email)}
                          >
                            <p className="font-semibold text-blue-600 hover:text-blue-800">{rental.user_name}</p>
                            <p className="text-sm text-gray-500">{rental.user_email}</p>
                            <p className="text-xs text-blue-500 mt-1">Click for details</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {rental.bike_image && (
                              <img 
                                src={rental.bike_image.startsWith('http') ? rental.bike_image : `http://localhost:5000${rental.bike_image}`}
                                alt={rental.bike_name}
                                className="w-12 h-12 rounded-lg object-cover mr-3"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{rental.bike_name}</p>
                              <p className="text-sm text-gray-500">{rental.bike_type} - ${rental.bike_price}/hr</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(rental.rental_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleReturnBike(rental.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
                          >
                            🔄 Mark Returned
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Tab - View all registered users and admins */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
            </div>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">👥</span>
                <p className="text-gray-500 text-lg">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-700 font-bold">Name</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-bold">Email</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-bold">Role</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-bold">Joined</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-bold">Total Rentals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                        {/* User name and profile info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-bold">{user.full_name?.charAt(0) || 'U'}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{user.full_name}</p>
                              <p className="text-sm text-gray-500">ID: {user.id}</p>
                            </div>
                          </div>
                        </td>
                        {/* User email */}
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        {/* User role with color coding */}
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                          </span>
                        </td>
                        {/* Registration date */}
                        <td className="px-6 py-4 text-gray-600">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        {/* Total rentals count */}
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">
                            {user.rental_count || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Customer Details</h2>
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                {/* User Info */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">👤 Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Rentals</p>
                      <p className="font-semibold text-gray-900">{selectedUser.rentals.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active Rentals</p>
                      <p className="font-semibold text-green-600">
                        {selectedUser.rentals.filter(r => r.status === 'confirmed' && !r.return_date).length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rental History */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">🚴 Rental History</h3>
                  {selectedUser.rentals.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No rental history</p>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedUser.rentals.map((rental) => (
                        <div key={rental.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              {rental.bike_image && (
                                <img 
                                  src={rental.bike_image.startsWith('http') ? rental.bike_image : `http://localhost:5000${rental.bike_image}`}
                                  alt={rental.bike_name}
                                  className="w-12 h-12 rounded-lg object-cover mr-3"
                                />
                              )}
                              <div>
                                <p className="font-semibold text-gray-900">{rental.bike_name}</p>
                                <p className="text-sm text-gray-500">{rental.bike_type}</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              rental.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              rental.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {rental.status === 'confirmed' ? '✅ Confirmed' :
                               rental.status === 'pending' ? '⏳ Pending' :
                               '❌ Rejected'}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <p><span className="font-semibold">Rental Date:</span> {new Date(rental.rental_date).toLocaleDateString()}</p>
                            {rental.return_date && (
                              <p><span className="font-semibold">Return Date:</span> {new Date(rental.return_date).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
