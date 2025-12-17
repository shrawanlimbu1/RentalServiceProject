// Importing React hooks, axios for API calls, and auth context
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

// UserDashboard component - shows user's rental history and stats
const UserDashboard = () => {
  // Get current user from AuthContext
  const authContext = useContext(AuthContext);
  const { user } = authContext || { user: null };
  
  // State to store user's rental history
  const [rentals, setRentals] = useState([]);

  // Fetch user's rentals when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchUserRentals(); // Only fetch if user is logged in
    }
  }, [user]);

  // Function to get user's rental history from backend
  const fetchUserRentals = async () => {
    try {
      // GET request to fetch rentals for specific user
      const res = await axios.get(`http://localhost:5000/api/rentals/user/${user.id}`);
      setRentals(res.data); // Save rental data to state
    } catch (err) {
      toast.error('Failed to fetch rentals'); // Show error if request fails
    }
  };

  // If user is not logged in, show login message
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-500">Please login to view your dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.full_name}!</p>
        </div>

        {/* Currently Rented Bikes */}
        {rentals.filter(r => r.status === 'confirmed' && !r.return_date).length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Currently Rented Bikes</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rentals
                  .filter(r => r.status === 'confirmed' && !r.return_date)
                  .map((rental) => (
                    <div key={rental.id} className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-3">
                        {rental.bike_image ? (
                          <img 
                            src={rental.bike_image.startsWith('http') ? rental.bike_image : `http://localhost:5000${rental.bike_image}`}
                            alt={rental.bike_name}
                            className="w-16 h-16 rounded-lg object-cover mr-3"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-2xl">🚴</span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-gray-900">{rental.bike_name}</h3>
                          <p className="text-sm text-gray-600">{rental.bike_type}</p>
                          <p className="text-sm font-semibold text-blue-600">${rental.bike_price}/hr</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><span className="font-semibold">Rented:</span> {new Date(rental.rental_date).toLocaleDateString()}</p>
                        <div className="mt-2 flex items-center">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                            🚴 Currently Riding
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">🚴</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600">Total Rentals</p>
                <p className="text-2xl font-bold text-gray-900">{rentals.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rentals.filter(r => r.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">🚴</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600">Currently Rented</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rentals.filter(r => r.status === 'confirmed' && !r.return_date).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rentals Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">My Bike Rentals</h2>
          </div>
          
          {rentals.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🚴</span>
              <p className="text-xl text-gray-500 mb-2">No rentals yet</p>
              <p className="text-gray-400">Start by requesting a bike rental from the home page!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-gray-700">Bike</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700">Type</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700">Rental Date</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700">Return Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.map((rental) => (
                    <tr key={rental.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {rental.bike_image ? (
                            <img 
                              src={rental.bike_image.startsWith('http') ? rental.bike_image : `http://localhost:5000${rental.bike_image}`}
                              alt={rental.bike_name}
                              className="w-12 h-12 rounded-lg object-cover mr-3"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white text-xl">🚴</span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{rental.bike_name}</p>
                            <p className="text-sm text-gray-500">${rental.bike_price}/hr</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{rental.bike_type}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(rental.rental_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          rental.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          rental.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {rental.status === 'confirmed' ? '✅ Confirmed' :
                           rental.status === 'pending' ? '⏳ Pending' :
                           '✅ Returned'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {rental.return_date ? new Date(rental.return_date).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;