// Importing React hooks and axios for API calls
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Home component - displays all available bikes for customers
const Home = () => {
  // Get current user from AuthContext
  const authContext = useContext(AuthContext);
  const { user } = authContext || { user: null };
  const navigate = useNavigate();

  // State to store array of bikes fetched from backend
  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRentals, setUserRentals] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const bannerImages = [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1544191696-15693072e0b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);

  // useEffect runs once when component mounts (page loads)
  useEffect(() => {
    fetchBikes();
    if (user) {
      fetchUserRentals();
    }
    // Set up polling to refresh bike status every 30 seconds
    const interval = setInterval(() => {
      fetchBikes();
      if (user) {
        fetchUserRentals();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);



  const fetchBikes = () => {
    axios.get("http://localhost:5000/api/bikes")
      .then(res => {
        setBikes(res.data);
        setFilteredBikes(res.data);
      })
      .catch(err => console.error(err));
  };

  const fetchUserRentals = () => {
    if (user) {
      axios.get(`http://localhost:5000/api/rentals/user/${user.id}`)
        .then(res => {
          setUserRentals(res.data);
        })
        .catch(err => console.error(err));
    }
  };

  // Filter bikes based on search term
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredBikes(bikes);
    } else {
      const filtered = bikes.filter(bike => {
        const nameMatch = bike.name.toLowerCase().includes(searchTerm.toLowerCase());
        const descMatch = bike.description.toLowerCase().includes(searchTerm.toLowerCase());
        const typeMatch = bike.type ? bike.type.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        return nameMatch || typeMatch || descMatch;
      });
      setFilteredBikes(filtered);
    }
  }, [searchTerm, bikes]);

  // Function to check if user has pending/active rental for this bike
  const getUserRentalStatus = (bikeId) => {
    const rental = userRentals.find(r => r.bike_id === bikeId && (r.status === 'pending' || r.status === 'confirmed'));
    return rental ? rental.status : null;
  };

  // Function to handle rental request
  const handleRentRequest = async (bikeId) => {
    if (!user) {
      toast.error('Please login to rent a bike');
      return;
    }

    // Check if user already has a pending or active rental for this bike
    const existingRental = getUserRentalStatus(bikeId);
    if (existingRental) {
      toast.error(`You already have a ${existingRental} rental for this bike`);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/rentals', {
        user_id: user.id,
        bike_id: bikeId
      });
      toast.success('Bike booked! Waiting for admin confirmation.');
      
      // Refresh data
      fetchBikes();
      fetchUserRentals();
      
      setTimeout(() => {
        const viewRentals = window.confirm('Would you like to view your rental requests?');
        if (viewRentals) {
          navigate('/my-rentals');
        }
      }, 1500);
    } catch (err) {
      toast.error('Failed to send rental request');
    }
  };

  // JSX return - the UI structure of the home page
  return (
    // Main container with light gray background
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner with Carousel */}
      <div className="relative h-96 bg-gradient-to-r from-blue-900 to-purple-900 overflow-hidden">
        <div className="flex h-full">
          {/* Left Side - Action Content */}
          <div className="w-3/5 flex items-center justify-center text-white p-8">
            <div className="text-center">
              <div className="mb-6">
                <p className="text-5xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse mb-2" style={{fontFamily: 'Georgia, serif'}}>Chase the road</p>
                <p className="text-3xl font-light opacity-80 animate-bounce" style={{fontFamily: 'Georgia, serif'}}>like you chase your dreams</p>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                <div className="flex flex-col items-center">
                  <span className="text-xl mb-1">✅</span>
                  <span>Premium Bikes</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl mb-1">🛡️</span>
                  <span>Fully Insured</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl mb-1">⚡</span>
                  <span>Instant Booking</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/bikes')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-bold transition transform hover:scale-105"
              >
                Start Your Journey
              </button>
            </div>
          </div>
          
          {/* Right Side - 3D Scrollable Images */}
          <div className="w-2/5 flex items-center justify-center p-8 relative" style={{perspective: '1000px'}}>
            <div className="relative w-80 h-64 group">
              {bannerImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    index === currentSlide ? 'translate-x-0 opacity-100' : 
                    index < currentSlide ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'
                  }`}
                  style={{
                    transform: index === currentSlide ? 'rotateY(-10deg) rotateX(5deg)' : 'rotateY(-10deg) rotateX(5deg) translateZ(-50px)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl" style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                  }}>
                    <img
                      src={image}
                      alt={`Bike ${index + 1}`}
                      className="w-full h-full object-cover transition-all duration-700 ease-out hover:scale-105 hover:brightness-110 hover:contrast-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute bottom-4 left-4 text-white opacity-0 hover:opacity-100 transition-all duration-500 transform translate-y-4 hover:translate-y-0">
                      <p className="text-sm font-bold drop-shadow-lg">Adventure Awaits</p>
                      <p className="text-xs opacity-80">Discover Your Journey</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-opacity-40 hover:scale-110 transition-all duration-300 z-20"
            >
              ←
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-opacity-40 hover:scale-110 transition-all duration-300 z-20"
            >
              →
            </button>
            
            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition ${
                    index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-16 px-4">
        
        {/* Page header with title and subtitle */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Rent Your Perfect Bike</h2>
          <p className="text-xl text-gray-600 mb-4">Choose from our premium collection</p>
          
          {/* View All Bikes button */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/bikes')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-lg transition transform hover:scale-105"
            >
              🚴 View All Bikes
            </button>
          </div>
          
          {/* Search bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search bikes by name, type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Grid layout for bike cards - responsive (1 col on mobile, 2 on tablet, 3 on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* Loop through filtered bikes and create a card */}
          {filteredBikes.map((bike) => (
            <div key={bike.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              
              {/* Bike image section - show image if available, otherwise show bike emoji */}
              {bike.image_url ? (
                <img 
                  src={bike.image_url.startsWith('data:') || bike.image_url.startsWith('http') ? bike.image_url : `http://localhost:5000${bike.image_url}`} 
                  alt={bike.name} 
                  className="w-full h-48 object-cover" 
                />
              ) : (
                // Fallback gradient background with bike emoji if no image
                <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-6xl">🚴</span>
                </div>
              )}

              {/* Card content section */}
              <div className="p-6">
                
                {/* Bike name and availability status */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{bike.name}</h3>
                  {/* Availability badge - green if available, yellow if booked, red if rented */}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    (() => {
                      const userStatus = getUserRentalStatus(bike.id);
                      if (userStatus === 'pending') return 'bg-yellow-100 text-yellow-700';
                      if (userStatus === 'confirmed') return 'bg-blue-100 text-blue-700';
                      if (!bike.available) return 'bg-red-100 text-red-700';
                      return 'bg-green-100 text-green-700';
                    })()
                  }`}>
                    {(() => {
                      const userStatus = getUserRentalStatus(bike.id);
                      if (userStatus === 'pending') return 'Pending';
                      if (userStatus === 'confirmed') return 'My Rental';
                      if (!bike.available) return 'Rented';
                      return 'Available';
                    })()}
                  </span>
                </div>
                
                {/* Bike type and description */}
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
                
                {/* Price and action section */}
                <div className="flex justify-between items-center pt-4 border-t">
                  {/* Price display */}
                  <span className="text-2xl font-bold text-gray-900">${bike.price_per_hour}<span className="text-sm text-gray-500">/hr</span></span>
                  
                  {/* Show different content based on user role and login status */}
                  {user && user.role !== 'admin' ? (
                    // Regular logged in user - show request button or status
                    (() => {
                      const userStatus = getUserRentalStatus(bike.id);
                      if (userStatus === 'pending') {
                        return (
                          <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-yellow-100 text-yellow-700">
                            ⏳ Pending Approval
                          </span>
                        );
                      }
                      if (userStatus === 'confirmed') {
                        return (
                          <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-100 text-blue-700">
                            🚴 Your Rental
                          </span>
                        );
                      }
                      if (bike.available) {
                        return (
                          <button 
                            onClick={() => handleRentRequest(bike.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
                          >
                            Book Now
                          </button>
                        );
                      }
                      return (
                        <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-700">
                          ✗ Not Available
                        </span>
                      );
                    })()
                  ) : (
                    // Admin or not logged in - show status only
                    <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      bike.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {bike.available ? '✓ Available' : '✗ Not Available'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show message if no bikes are available */}
        {bikes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No bikes available at the moment</p>
          </div>
        ) : filteredBikes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No bikes found matching your search</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Clear search
            </button>
          </div>
        ) : null}

        {/* Bike Categories Section */}
        <div className="mt-20 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-xl text-gray-600">Find the perfect bike for your adventure</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* Off-Road Category */}
            <div 
              onClick={() => navigate('/bikes?category=off-road')}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 p-6 text-center"
            >
              <div className="text-4xl mb-3">🏔️</div>
              <h3 className="font-bold text-gray-900 mb-2">Off-Road</h3>
              <p className="text-sm text-gray-600">Adventure & Trail</p>
            </div>

            {/* Highway Category */}
            <div 
              onClick={() => navigate('/bikes?category=Highway')}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 p-6 text-center"
            >
              <div className="text-4xl mb-3">🛣️</div>
              <h3 className="font-bold text-gray-900 mb-2">Highway</h3>
              <p className="text-sm text-gray-600">Speed & Performance</p>
            </div>

            {/* Hybrid Category */}
            <div 
              onClick={() => navigate('/bikes?category=Hybrid')}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 p-6 text-center"
            >
              <div className="text-4xl mb-3">🚴</div>
              <h3 className="font-bold text-gray-900 mb-2">Hybrid</h3>
              <p className="text-sm text-gray-600">Versatile & Comfortable</p>
            </div>

            {/* Electric Category */}
            <div 
              onClick={() => navigate('/bikes?category=Electric')}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 p-6 text-center"
            >
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold text-gray-900 mb-2">Electric</h3>
              <p className="text-sm text-gray-600">Eco & Efficient</p>
            </div>

            {/* Touring Category */}
            <div 
              onClick={() => navigate('/bikes?category=Touring')}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 p-6 text-center"
            >
              <div className="text-4xl mb-3">🌍</div>
              <h3 className="font-bold text-gray-900 mb-2">Touring</h3>
              <p className="text-sm text-gray-600">Long Distance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
