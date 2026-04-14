import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const BikesCatalog = () => {
  const authContext = useContext(AuthContext);
  const { user } = authContext || { user: null };
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [userRentals, setUserRentals] = useState([]);
  const [selectedBike, setSelectedBike] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBikes();
    if (user) {
      fetchUserRentals();
    }
    
    // Set filter from URL parameter
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setFilterType(categoryParam);
    }
  }, [user, searchParams]);

  // Filter bikes based on search and type filter
  useEffect(() => {
    let filtered = bikes;
    
    if (searchTerm) {
      filtered = filtered.filter(bike => 
        bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bike.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bike.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType) {
      filtered = filtered.filter(bike => 
        bike.type && bike.type.toLowerCase().includes(filterType.toLowerCase())
      );
    }
    
    setFilteredBikes(filtered);
  }, [searchTerm, filterType, bikes]);

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

  // Get unique bike types for filter dropdown
  const bikeTypes = [...new Set(
    bikes.flatMap(bike => 
      bike.type ? bike.type.split(', ').map(type => type.trim()) : []
    )
  )];
  
  const openBikeModal = (bike) => {
    setSelectedBike(bike);
    setShowModal(true);
  };
  
  const closeBikeModal = () => {
    setSelectedBike(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-16 px-4">
        
        {/* Page header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {filterType ? `${filterType} Bikes` : 'Our Bike Collection'}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {filterType ? `Explore our ${filterType.toLowerCase()} bike collection` : 'Explore all available bikes for rent'}
          </p>
          
          {/* Search and Filter Controls */}
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 mb-8">
            {/* Search bar */}
            <div className="flex-1 relative">
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
            
            {/* Type filter */}
            <div className="md:w-64">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              >
                <option value="">All Types</option>
                {bikeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {/* Clear filters */}
            {(searchTerm || filterType) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="max-w-7xl mx-auto mb-6">
          <p className="text-gray-600">
            Showing {filteredBikes.length} of {bikes.length} bikes
            {searchTerm && ` for "${searchTerm}"`}
            {filterType && ` in ${filterType} category`}
          </p>
        </div>

        {/* Bikes grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          
          {filteredBikes.map((bike) => (
            <div key={bike.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden cursor-pointer" onClick={() => openBikeModal(bike)}>
              
              {/* Bike image */}
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

              {/* Card content */}
              <div className="p-6">
                
                {/* Bike name and availability status */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{bike.name}</h3>
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
                <p className="text-blue-600 font-semibold mb-2">{bike.type}</p>
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">{bike.description}</p>
                
                {/* Price and action section */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-2xl font-bold text-gray-900">Rs {bike.price_per_hour}<span className="text-sm text-gray-500">/hr</span></span>
                  
                  {/* Action buttons based on user status */}
                  {user && user.role !== 'admin' ? (
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRentRequest(bike.id);
                            }}
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

        {/* No results message */}
        {filteredBikes.length === 0 && bikes.length > 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500 mb-4">No bikes found matching your criteria</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterType('');
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Empty state */}
        {bikes.length === 0 && (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">🚴</span>
            <p className="text-xl text-gray-500">No bikes available at the moment</p>
          </div>
        )}
      </div>
      
      {/* Bike Details Modal */}
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
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  (() => {
                    const userStatus = getUserRentalStatus(selectedBike.id);
                    if (userStatus === 'pending') return 'bg-yellow-100 text-yellow-700';
                    if (userStatus === 'confirmed') return 'bg-blue-100 text-blue-700';
                    if (!selectedBike.available) return 'bg-red-100 text-red-700';
                    return 'bg-green-100 text-green-700';
                  })()
                }`}>
                  {(() => {
                    const userStatus = getUserRentalStatus(selectedBike.id);
                    if (userStatus === 'pending') return 'Pending';
                    if (userStatus === 'confirmed') return 'My Rental';
                    if (!selectedBike.available) return 'Rented';
                    return 'Available';
                  })()}
                </span>
              </div>
              
              <div className="mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full">{selectedBike.type}</span>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">Rs {selectedBike.price_per_hour}</span>
                <span className="text-lg text-gray-500 ml-2">/hour</span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{selectedBike.description || 'No description available.'}</p>
              </div>
              
              <div className="flex gap-3">
                {user && user.role !== 'admin' ? (
                  (() => {
                    const userStatus = getUserRentalStatus(selectedBike.id);
                    if (userStatus === 'pending') {
                      return (
                        <span className="flex-1 px-6 py-3 rounded-lg text-center font-semibold bg-yellow-100 text-yellow-700">
                          ⏳ Pending Approval
                        </span>
                      );
                    }
                    if (userStatus === 'confirmed') {
                      return (
                        <span className="flex-1 px-6 py-3 rounded-lg text-center font-semibold bg-blue-100 text-blue-700">
                          🚴 Your Rental
                        </span>
                      );
                    }
                    if (selectedBike.available) {
                      return (
                        <button 
                          onClick={() => {
                            handleRentRequest(selectedBike.id);
                            closeBikeModal();
                          }}
                          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
                        >
                          Book Now
                        </button>
                      );
                    }
                    return (
                      <span className="flex-1 px-6 py-3 rounded-lg text-center font-semibold bg-red-100 text-red-700">
                        ✗ Not Available
                      </span>
                    );
                  })()
                ) : (
                  <span className={`flex-1 px-6 py-3 rounded-lg text-center font-semibold ${
                    selectedBike.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedBike.available ? '✓ Available' : '✗ Not Available'}
                  </span>
                )}
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
  );
};

export default BikesCatalog;