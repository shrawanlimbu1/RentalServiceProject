import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useFavourites } from '../hooks/useFavourites';

const Recommendations = () => {
  const authContext = useContext(AuthContext);
  const { user } = authContext || { user: null };
  const navigate = useNavigate();
  const { favouriteIds, toggleFavourite } = useFavourites(user);

  const [recommendations, setRecommendations] = useState([]);
  const [allBikes, setAllBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBike, setSelectedBike] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [similarBikes, setSimilarBikes] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
      fetchAllBikes();
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

  const fetchAllBikes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bikes');
      setAllBikes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateRental = (start, end, pricePerDay) => {
    if (start && end) {
      const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
      if (days > 10) { toast.error('Maximum booking duration is 10 days'); return; }
      if (days > 0) { setTotalDays(days); setTotalPrice(days * pricePerDay); }
    }
  };

  const openBikeModal = (bike) => {
    setSelectedBike(bike);
    setStartDate(''); setEndDate(''); setTotalDays(0); setTotalPrice(0);
    setShowModal(true);
    const similar = allBikes.filter(b =>
      b.id !== bike.id && b.available && b.type && bike.type &&
      b.type.split(', ').some(t => bike.type.split(', ').includes(t))
    ).slice(0, 6);
    setSimilarBikes(similar);
  };

  const closeModal = () => { setSelectedBike(null); setShowModal(false); };

  const handleRentRequest = async (bikeId) => {
    if (!user.license_number) { toast.error('Please add your license number in profile first'); navigate('/profile'); return; }
    if (!startDate || !endDate) { toast.error('Please select start and end dates'); return; }
    try {
      await axios.post('http://localhost:5000/api/rentals', {
        user_id: user.id, bike_id: bikeId,
        start_date: startDate, end_date: endDate, total_price: totalPrice
      });
      toast.success('Bike booked! Waiting for admin confirmation.');
      closeModal();
    } catch (err) {
      toast.error(err.response?.data || 'Failed to send rental request');
    }
  };

  const imgSrc = (url) => url && (url.startsWith('data:') || url.startsWith('http')) ? url : `http://localhost:5000${url}`;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Please login to view recommendations</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Recommended for You</h1>
          <p className="text-sm text-gray-500 mt-1">Personalized suggestions based on your rental history</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Finding bikes for you...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Yet</h2>
            <p className="text-sm text-gray-500 mb-5">Rent a few bikes to get personalized suggestions.</p>
            <button onClick={() => navigate('/')} className="px-5 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors">Browse Bikes</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {recommendations.map((bike) => (
              <div
                key={bike.id}
                onClick={() => openBikeModal(bike)}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                {bike.image_url ? (
                  <img src={imgSrc(bike.image_url)} alt={bike.name} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-300 text-xs">No image</div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm truncate pr-2">{bike.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700 flex-shrink-0">For You</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{bike.type}</p>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{bike.description}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-sm font-bold text-gray-900">Rs {bike.price_per_hour}<span className="text-xs text-gray-400 font-normal">/day</span></span>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => toggleFavourite(bike.id, e)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <svg className="w-4 h-4" fill={favouriteIds.has(bike.id) ? '#ef4444' : 'none'} stroke={favouriteIds.has(bike.id) ? '#ef4444' : '#9ca3af'} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); openBikeModal(bike); }} className="px-3 py-1 bg-gray-900 text-white text-xs rounded-full hover:bg-gray-700 transition-colors">Book</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedBike && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col">

            <div className="relative flex-shrink-0">
              <button onClick={closeModal} className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-md text-lg">×</button>
              <button onClick={(e) => toggleFavourite(selectedBike.id, e)} className="absolute top-3 left-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                <svg className="w-4 h-4" fill={favouriteIds.has(selectedBike.id) ? '#ef4444' : 'none'} stroke={favouriteIds.has(selectedBike.id) ? '#ef4444' : '#9ca3af'} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              {selectedBike.image_url ? (
                <img src={imgSrc(selectedBike.image_url)} alt={selectedBike.name} className="w-full h-52 object-cover sm:rounded-t-2xl rounded-t-2xl" />
              ) : (
                <div className="w-full h-52 bg-gray-100 flex items-center justify-center text-gray-300 sm:rounded-t-2xl rounded-t-2xl">No image</div>
              )}
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4">
              <div className="flex justify-between items-start mb-1">
                <h2 className="text-xl font-bold text-gray-900">{selectedBike.name}</h2>
                <span className="text-xs px-2 py-1 rounded-full font-medium ml-2 flex-shrink-0 bg-green-100 text-green-700">For You</span>
              </div>
              <p className="text-sm text-gray-400 mb-1">{selectedBike.type}</p>
              <p className="text-2xl font-bold text-gray-900 mb-4">Rs {selectedBike.price_per_hour}<span className="text-sm text-gray-400 font-normal">/day</span></p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                  <input type="date" min={new Date().toISOString().split('T')[0]} value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); calculateRental(e.target.value, endDate, selectedBike.price_per_hour); }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                  <input type="date" min={startDate || new Date().toISOString().split('T')[0]} value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); calculateRental(startDate, e.target.value, selectedBike.price_per_hour); }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
              </div>

              {totalDays > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-sm">
                  <div className="flex justify-between mb-1 text-gray-500"><span>Duration</span><span className="font-medium text-gray-800">{totalDays} day{totalDays > 1 ? 's' : ''}</span></div>
                  <div className="flex justify-between font-semibold border-t border-gray-200 pt-2"><span>Total</span><span className="text-green-700">Rs {totalPrice}</span></div>
                </div>
              )}

              <p className="text-sm text-gray-500 mb-5 leading-relaxed">{selectedBike.description || 'No description available.'}</p>

              {similarBikes.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-semibold text-gray-800 mb-3">Similar Bikes</p>
                  <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {similarBikes.map(b => (
                      <div key={b.id} onClick={() => openBikeModal(b)}
                        className="flex-shrink-0 w-36 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:border-gray-400 hover:shadow-sm cursor-pointer transition">
                        {b.image_url ? (
                          <img src={imgSrc(b.image_url)} alt={b.name} className="w-full h-24 object-cover" />
                        ) : (
                          <div className="w-full h-24 bg-gray-200" />
                        )}
                        <div className="p-2">
                          <p className="text-xs font-semibold text-gray-800 truncate">{b.name}</p>
                          <p className="text-xs text-gray-400">Rs {b.price_per_hour}/day</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 px-5 py-4 border-t border-gray-100 flex-shrink-0">
              {selectedBike.available ? (
                <button
                  onClick={() => { handleRentRequest(selectedBike.id); closeModal(); }}
                  disabled={!startDate || !endDate || totalDays <= 0}
                  className="flex-1 py-2.5 bg-gray-900 text-white text-sm rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {totalDays > 0 ? `Book for Rs ${totalPrice}` : 'Select Dates to Book'}
                </button>
              ) : (
                <span className="flex-1 text-center py-2.5 text-sm bg-red-50 text-red-700 rounded-xl border border-red-200">Not Available</span>
              )}
              <button onClick={closeModal} className="px-5 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
