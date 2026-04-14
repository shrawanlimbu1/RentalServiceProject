import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Recommendations = () => {
  const authContext = useContext(AuthContext);
  const { user } = authContext || { user: null };
  const navigate = useNavigate();
  
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBike, setSelectedBike] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/recommendations/${user.id}`);
      setRecommendations(res.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch recommendations');
      setLoading(false);
    }
  };

  const calculateRental = (start, end, pricePerDay) => {
    if (start && end) {
      const startD = new Date(start);
      const endD = new Date(end);
      const days = Math.ceil((endD - startD) / (1000 * 60 * 60 * 24)) + 1;
      if (days > 0) {
        setTotalDays(days);
        setTotalPrice(days * pricePerDay);
      }
    }
  };

  const openBikeModal = (bike) => {
    setSelectedBike(bike);
    setStartDate('');
    setEndDate('');
    setTotalDays(0);
    setTotalPrice(0);
    setShowModal(true);
  };

  const closeBikeModal = () => {
    setSelectedBike(null);
    setShowModal(false);
  };

  const handleRentRequest = async (bikeId) => {
    if (!user.license_number) {
      toast.error('Please add your license number in profile to book a bike');
      navigate('/profile');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/rentals', {
        user_id: user.id,
        bike_id: bikeId,
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice
      });
      toast.success('Bike booked! Waiting for admin confirmation.');
      closeBikeModal();
    } catch (err) {
      toast.error(err.response?.data || 'Failed to send rental request');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-500">Please login to view recommendations</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🎯 Recommended for You</h1>
          <p className="text-xl text-gray-600">Personalized bike suggestions based on your preferences and rental history</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Finding perfect bikes for you...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">🚴</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Recommendations Yet</h2>
            <p className="text-gray-600 mb-6">Rent a few bikes to get personalized recommendations!</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
            >
              Browse All Bikes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((bike) => (
              <div key={bike.id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden cursor-pointer border-2 border-blue-200" onClick={() => openBikeModal(bike)}>
                {bike.image_url ? (
                  <img 
                    src={bike.image_url.startsWith('data:') || bike.image_url.startsWith('http') ? bike.image_url : `http://localhost:5000${bike.image_url}`} 
                    alt={bike.name} 
                    className="w-full h-48 object-cover" 
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-6xl">🚴</span>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{bike.name}</h3>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">⭐ Recommended</span>
                  </div>
                  
                  <div className="mb-2">
                    {bike.type && bike.type.includes(', ') ? (
                      <div className="flex flex-wrap gap-1">
                        {bike.type.split(', ').map(type => (
                          <span key={type} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">{type}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-blue-600 font-semibold">{bike.type}</p>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{bike.description}</p>
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-2xl font-bold text-gray-900">Rs {bike.price_per_hour}<span className="text-sm text-gray-500">/day</span></span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openBikeModal(bike);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold transition"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Modal */}
        {showModal && selectedBike && (
          <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                <button 
                  onClick={closeBikeModal}
                  className="absolute top-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-600 hover:text-gray-800 w-8 h-8 rounded-full flex items-center justify-center transition z-10"
                >
                  ×
                </button>
                
                {selectedBike.image_url ? (
                  <img 
                    src={selectedBike.image_url.startsWith('data:') || selectedBike.image_url.startsWith('http') ? selectedBike.image_url : `http://localhost:5000${selectedBike.image_url}`} 
                    alt={selectedBike.name} 
                    className="w-full h-64 object-cover rounded-t-2xl" 
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center rounded-t-2xl">
                    <span className="text-8xl">🚴</span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-3xl font-bold text-gray-900">{selectedBike.name}</h2>
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">⭐ Recommended</span>
                </div>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">Rs {selectedBike.price_per_hour}</span>
                  <span className="text-lg text-gray-500 ml-2">/day</span>
                </div>
                
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          calculateRental(e.target.value, endDate, selectedBike.price_per_hour);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        min={startDate || new Date().toISOString().split('T')[0]}
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          calculateRental(startDate, e.target.value, selectedBike.price_per_hour);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  {totalDays > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-700">Duration:</span>
                        <span className="font-semibold">{totalDays} day{totalDays > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total Price:</span>
                        <span className="text-green-600">Rs {totalPrice}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleRentRequest(selectedBike.id)}
                    disabled={!startDate || !endDate || totalDays <= 0}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {totalDays > 0 ? `Book for Rs ${totalPrice}` : 'Select Dates'}
                  </button>
                  <button 
                    onClick={closeBikeModal}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;