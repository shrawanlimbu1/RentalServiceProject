import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyRentals = () => {
  const authContext = useContext(AuthContext);
  const { user } = authContext || { user: null };
  const [activeRentals, setActiveRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchActiveRentals();
  }, [user]);

  const fetchActiveRentals = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/rentals/user/${user.id}`);
      const active = res.data.filter(r => (r.status === 'confirmed' || r.status === 'pending') && !r.return_date);
      setActiveRentals(active);
      setLoading(false);
      if (active.length === 0) setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      toast.error('Failed to fetch rentals');
      setLoading(false);
    }
  };

  const handleCancelRental = async (rentalId) => {
    try {
      await axios.put(`http://localhost:5000/api/rentals/${rentalId}/cancel`);
      toast.success('Rental cancelled');
      fetchActiveRentals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel rental');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Please login to view your rentals</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Rented Bikes</h1>
          <p className="text-sm text-gray-500 mt-1">Bikes you currently have rented or pending</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading your rentals...</p>
          </div>
        ) : activeRentals.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No Active Rentals</h2>
            <p className="text-sm text-gray-500 mb-1">You don't have any bikes rented right now.</p>
            <p className="text-xs text-gray-400 mb-5">Redirecting to browse bikes in 2 seconds...</p>
            <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700 transition-colors">
              Browse Bikes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeRentals.map((rental) => (
              <div key={rental.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {rental.bike_image ? (
                  <img
                    src={rental.bike_image.startsWith('data:') || rental.bike_image.startsWith('http') ? rental.bike_image : `http://localhost:5000${rental.bike_image}`}
                    alt={rental.bike_name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">No image</div>
                )}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{rental.bike_name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${rental.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {rental.status === 'pending' ? 'Pending' : 'Active'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{rental.bike_type}</p>
                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span>Rental Date</span>
                      <span className="font-medium">{new Date(rental.rental_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price/day</span>
                      <span className="font-medium">Rs {rental.bike_price}</span>
                    </div>
                  </div>
                  {rental.status === 'pending' ? (
                    <div className="flex gap-2">
                      <p className="flex-1 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
                        Waiting for admin approval
                      </p>
                      <button
                        onClick={() => handleCancelRental(rental.id)}
                        className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 text-xs rounded hover:bg-red-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">
                      Please return the bike to the designated location when done.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRentals;
