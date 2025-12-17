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
    if (user) {
      fetchActiveRentals();
    }
  }, [user]);

  const fetchActiveRentals = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/rentals/user/${user.id}`);
      const active = res.data.filter(rental => rental.status === 'confirmed' && !rental.return_date);
      setActiveRentals(active);
      setLoading(false);
      
      // Redirect to home if no active rentals
      if (active.length === 0) {
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      toast.error('Failed to fetch rentals');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-500">Please login to view your rentals</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Rented Bikes</h1>
          <p className="text-gray-600 mt-1">Bikes you currently have rented</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your rentals...</p>
          </div>
        ) : activeRentals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <span className="text-6xl mb-4 block">🚴</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Rentals</h2>
            <p className="text-gray-600 mb-4">You don't have any bikes rented at the moment</p>
            <p className="text-sm text-gray-500 mb-6">Redirecting to browse bikes in 2 seconds...</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
            >
              Browse Bikes Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRentals.map((rental) => (
              <div key={rental.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition">
                {rental.bike_image ? (
                  <img 
                    src={rental.bike_image.startsWith('http') ? rental.bike_image : `http://localhost:5000${rental.bike_image}`}
                    alt={rental.bike_name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-6xl">🚴</span>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{rental.bike_name}</h3>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      🚴 Rented
                    </span>
                  </div>
                  
                  <p className="text-blue-600 font-semibold mb-2">{rental.bike_type}</p>
                  <p className="text-gray-600 mb-4">{rental.bike_description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rental Date:</span>
                      <span className="font-semibold">{new Date(rental.rental_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per Hour:</span>
                      <span className="font-semibold text-green-600">${rental.bike_price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-green-600">Active</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">📍 Remember:</span> Return the bike to the designated location when finished
                      </p>
                    </div>
                  </div>
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