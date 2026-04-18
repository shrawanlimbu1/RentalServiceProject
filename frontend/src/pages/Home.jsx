import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useFavourites } from '../hooks/useFavourites';

const Home = () => {
  const authContext = useContext(AuthContext);
  const { user } = authContext || { user: null };
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const { favouriteIds, toggleFavourite } = useFavourites(user);

  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRentals, setUserRentals] = useState([]);
  const [selectedBike, setSelectedBike] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [similarBikes, setSimilarBikes] = useState([]);

  useEffect(() => {
    fetchBikes();
    if (user) fetchUserRentals();
    const interval = setInterval(() => {
      fetchBikes();
      if (user) fetchUserRentals();
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredBikes(bikes);
    } else {
      setFilteredBikes(bikes.filter(bike =>
        bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bike.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bike.type && bike.type.toLowerCase().includes(searchTerm.toLowerCase()))
      ));
    }
  }, [searchTerm, bikes]);

  const fetchBikes = () => {
    axios.get("http://localhost:5000/api/bikes")
      .then(res => { setBikes(res.data); setFilteredBikes(res.data); })
      .catch(err => console.error(err));
  };

  const fetchUserRentals = () => {
    if (user) {
      axios.get(`http://localhost:5000/api/rentals/user/${user.id}`)
        .then(res => setUserRentals(res.data))
        .catch(err => console.error(err));
    }
  };

  const getUserRentalStatus = (bikeId) => {
    const rental = userRentals.find(r => r.bike_id === bikeId && (r.status === 'pending' || r.status === 'confirmed'));
    return rental ? rental.status : null;
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
    const similar = bikes.filter(b =>
      b.id !== bike.id && b.available && b.type && bike.type &&
      b.type.split(', ').some(t => bike.type.split(', ').includes(t))
    ).slice(0, 6);
    setSimilarBikes(similar);
  };

  const closeBikeModal = () => { setSelectedBike(null); setShowModal(false); };

  const handleRentRequest = async (bikeId) => {
    if (!user) { toast.error('Please login to rent a bike'); return; }
    if (!user.license_number) { toast.error('Please add your license number in profile first'); navigate('/profile'); return; }
    if (!startDate || !endDate) { toast.error('Please select start and end dates'); return; }
    const existingRental = getUserRentalStatus(bikeId);
    if (existingRental) { toast.error(`You already have a ${existingRental} rental for this bike`); return; }
    try {
      await axios.post('http://localhost:5000/api/rentals', {
        user_id: user.id, bike_id: bikeId,
        start_date: startDate, end_date: endDate, total_price: totalPrice
      });
      toast.success('Bike booked! Waiting for admin confirmation.');
      fetchBikes(); fetchUserRentals();
      setTimeout(() => {
        if (window.confirm('Would you like to view your rental requests?')) navigate('/my-rentals');
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data || 'Failed to send rental request');
    }
  };

  const statusBadge = (bikeId, available) => {
    const s = getUserRentalStatus(bikeId);
    if (s === 'pending') return { cls: 'bg-yellow-100 text-yellow-700', label: 'Pending' };
    if (s === 'confirmed') return { cls: 'bg-blue-100 text-blue-700', label: 'My Rental' };
    if (!available) return { cls: 'bg-red-100 text-red-700', label: 'Rented' };
    return { cls: 'bg-green-100 text-green-700', label: 'Available' };
  };

  const imgSrc = (url) => url && (url.startsWith('data:') || url.startsWith('http')) ? url : `http://localhost:5000${url}`;

  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="relative bg-gray-900 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative max-w-5xl mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row items-center gap-10">

            {/* Left text */}
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block bg-white text-gray-900 text-xs font-medium px-3 py-1 rounded-full mb-4">
                Up to 10 days rental
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                Rent a Bike,<br />
                <span className="text-gray-300">Ride Your Way</span>
              </h1>
              <p className="text-gray-400 mb-8 text-base leading-relaxed">
                Choose from our collection of well-maintained bikes.<br className="hidden md:block" />
                Book in minutes, ride the same day.
              </p>

              {/* Stats row */}
              <div className="flex justify-center md:justify-start gap-8 mb-8">
                <div>
                  <p className="text-2xl font-bold text-white">{bikes.length}+</p>
                  <p className="text-xs text-gray-400">Bikes Available</p>
                </div>
                <div className="w-px bg-gray-700" />
                <div>
                  <p className="text-2xl font-bold text-white">10</p>
                  <p className="text-xs text-gray-400">Max Days</p>
                </div>
                <div className="w-px bg-gray-700" />
                <div>
                  <p className="text-2xl font-bold text-white">5</p>
                  <p className="text-xs text-gray-400">Categories</p>
                </div>
              </div>

              {/* Search + CTA */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <input
                  type="text"
                  placeholder="Search bikes by name or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2.5 rounded-xl text-sm bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 w-full sm:w-64"
                />
                <button
                  onClick={() => navigate('/bikes')}
                  className="px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors flex-shrink-0"
                >
                  View All Bikes
                </button>
              </div>
            </div>

            {/* Right — featured bike card */}
            {bikes.filter(b => b.available && b.image_url).slice(0, 1).map(bike => (
              <div
                key={bike.id}
                onClick={() => openBikeModal(bike)}
                className="flex-shrink-0 w-64 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-2xl overflow-hidden cursor-pointer hover:bg-opacity-10 transition-all"
              >
                <div className="relative">
                  <img src={imgSrc(bike.image_url)} alt={bike.name} className="w-full h-44 object-cover" />
                  <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">Available</span>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-white text-sm mb-0.5">{bike.name}</p>
                  <p className="text-xs text-gray-400 mb-3">{bike.type}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-sm">Rs {bike.price_per_hour}<span className="text-gray-400 font-normal text-xs">/day</span></span>
                    <span className="text-xs text-gray-300 bg-white bg-opacity-10 px-2 py-1 rounded-lg">Tap to book</span>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Horizontal scrolling bikes */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Available Bikes</h2>
            <div className="flex gap-2">
              <button onClick={() => scroll(-1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-sm">←</button>
              <button onClick={() => scroll(1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-sm">→</button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-3"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredBikes.length === 0 && (
              <p className="text-gray-400 text-sm py-8 w-full text-center">
                {bikes.length === 0 ? 'No bikes available.' : 'No bikes match your search.'}
              </p>
            )}
            {filteredBikes.map((bike) => {
              const badge = statusBadge(bike.id, bike.available);
              return (
                <div
                  key={bike.id}
                  onClick={() => openBikeModal(bike)}
                  className="flex-shrink-0 w-64 bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                >
                  {bike.image_url ? (
                    <img src={imgSrc(bike.image_url)} alt={bike.name} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-300 text-xs">No image</div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate pr-2">{bike.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{bike.type}</p>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">{bike.description}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-sm font-bold text-gray-900">Rs {bike.price_per_hour}<span className="text-xs text-gray-400 font-normal">/day</span></span>
                      <div className="flex items-center gap-1">
                        {user && user.role !== 'admin' && (
                          <button onClick={(e) => toggleFavourite(bike.id, e)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                            <svg className="w-4 h-4" fill={favouriteIds.has(bike.id) ? '#ef4444' : 'none'} stroke={favouriteIds.has(bike.id) ? '#ef4444' : '#9ca3af'} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        )}
                        {user && user.role !== 'admin' && bike.available && !getUserRentalStatus(bike.id) && (
                          <button onClick={(e) => { e.stopPropagation(); openBikeModal(bike); }} className="px-3 py-1 bg-gray-900 text-white text-xs rounded-full hover:bg-gray-700 transition-colors">Book</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {[
              { label: 'Off-Road', desc: 'Adventure & Trail' },
              { label: 'Highway', desc: 'Speed & Performance' },
              { label: 'Hybrid', desc: 'Versatile & Comfortable' },
              { label: 'Electric', desc: 'Eco & Efficient' },
              { label: 'Touring', desc: 'Long Distance' },
            ].map(cat => (
              <button
                key={cat.label}
                onClick={() => navigate(`/bikes?category=${cat.label}`)}
                className="flex-shrink-0 bg-white border border-gray-200 rounded-xl px-5 py-4 text-left hover:border-gray-400 hover:shadow-sm transition min-w-36"
              >
                <p className="font-semibold text-gray-900 text-sm">{cat.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedBike && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col">

            {/* Image */}
            <div className="relative flex-shrink-0">
              <button onClick={closeBikeModal} className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-md text-lg">×</button>
              {user && user.role !== 'admin' && (
                <button onClick={(e) => toggleFavourite(selectedBike.id, e)} className="absolute top-3 left-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4" fill={favouriteIds.has(selectedBike.id) ? '#ef4444' : 'none'} stroke={favouriteIds.has(selectedBike.id) ? '#ef4444' : '#9ca3af'} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              )}
              {selectedBike.image_url ? (
                <img src={imgSrc(selectedBike.image_url)} alt={selectedBike.name} className="w-full h-52 object-cover sm:rounded-t-2xl rounded-t-2xl" />
              ) : (
                <div className="w-full h-52 bg-gray-100 flex items-center justify-center text-gray-300 sm:rounded-t-2xl rounded-t-2xl">No image</div>
              )}
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 py-4">

              {/* Title & status */}
              <div className="flex justify-between items-start mb-1">
                <h2 className="text-xl font-bold text-gray-900">{selectedBike.name}</h2>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 flex-shrink-0 ${statusBadge(selectedBike.id, selectedBike.available).cls}`}>
                  {statusBadge(selectedBike.id, selectedBike.available).label}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-1">{selectedBike.type}</p>
              <p className="text-2xl font-bold text-gray-900 mb-4">
                Rs {selectedBike.price_per_hour}<span className="text-sm text-gray-400 font-normal">/day</span>
              </p>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); calculateRental(e.target.value, endDate, selectedBike.price_per_hour); }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    min={startDate || new Date().toISOString().split('T')[0]}
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); calculateRental(startDate, e.target.value, selectedBike.price_per_hour); }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
              </div>

              {/* Price summary */}
              {totalDays > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-sm">
                  <div className="flex justify-between mb-1 text-gray-500">
                    <span>Duration</span>
                    <span className="font-medium text-gray-800">{totalDays} day{totalDays > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span className="text-green-700">Rs {totalPrice}</span>
                  </div>
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">{selectedBike.description || 'No description available.'}</p>

              {/* Similar bikes horizontal scroll */}
              {similarBikes.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-semibold text-gray-800 mb-3">Similar Bikes</p>
                  <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {similarBikes.map(b => (
                      <div
                        key={b.id}
                        onClick={() => openBikeModal(b)}
                        className="flex-shrink-0 w-36 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:border-gray-400 hover:shadow-sm cursor-pointer transition"
                      >
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

            {/* Sticky action buttons */}
            <div className="flex gap-2 px-5 py-4 border-t border-gray-100 flex-shrink-0">
              {user && user.role !== 'admin' ? (
                (() => {
                  const s = getUserRentalStatus(selectedBike.id);
                  if (s === 'pending') return <span className="flex-1 text-center py-2.5 text-sm bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-200">Pending Approval</span>;
                  if (s === 'confirmed') return <span className="flex-1 text-center py-2.5 text-sm bg-blue-50 text-blue-700 rounded-xl border border-blue-200">Your Rental</span>;
                  if (selectedBike.available) return (
                    <button
                      onClick={() => { handleRentRequest(selectedBike.id); closeBikeModal(); }}
                      disabled={!startDate || !endDate || totalDays <= 0}
                      className="flex-1 py-2.5 bg-gray-900 text-white text-sm rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {totalDays > 0 ? `Book for Rs ${totalPrice}` : 'Select Dates to Book'}
                    </button>
                  );
                  return <span className="flex-1 text-center py-2.5 text-sm bg-red-50 text-red-700 rounded-xl border border-red-200">Not Available</span>;
                })()
              ) : (
                <span className={`flex-1 text-center py-2.5 text-sm rounded-xl border ${selectedBike.available ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {selectedBike.available ? 'Available' : 'Not Available'}
                </span>
              )}
              <button onClick={closeBikeModal} className="px-5 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">Close</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
