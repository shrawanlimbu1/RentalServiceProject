import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const UserDashboard = () => {
  const authContext = useContext(AuthContext);
  const { user } = authContext || { user: null };
  const [rentals, setRentals] = useState([]);

  useEffect(() => {
    if (user) fetchUserRentals();
  }, [user]);

  const fetchUserRentals = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/rentals/user/${user.id}`);
      setRentals(res.data);
    } catch (err) {
      toast.error('Failed to fetch rentals');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Please login to view your dashboard</p>
      </div>
    );
  }

  const statusStyle = (status) => {
    if (status === 'confirmed') return 'bg-green-100 text-green-700';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-600';
  };

  const statusLabel = (rental) => {
    if (rental.status === 'confirmed' && !rental.return_date) return 'Active';
    if (rental.status === 'confirmed') return 'Returned';
    if (rental.status === 'pending') return 'Pending';
    return rental.status;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user.full_name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Rentals', value: rentals.length },
            { label: 'Confirmed', value: rentals.filter(r => r.status === 'confirmed').length },
            { label: 'Currently Active', value: rentals.filter(r => r.status === 'confirmed' && !r.return_date).length },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-5">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Rentals table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Rental History</h2>
          </div>
          {rentals.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>No rentals yet.</p>
              <p className="text-sm mt-1">Browse bikes from the home page to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bike</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rental Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rentals.map((rental) => (
                    <tr key={rental.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {rental.bike_image ? (
                            <img
                              src={rental.bike_image.startsWith('data:') || rental.bike_image.startsWith('http') ? rental.bike_image : `http://localhost:5000${rental.bike_image}`}
                              alt={rental.bike_name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">N/A</div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{rental.bike_name}</p>
                            <p className="text-xs text-gray-400">Rs {rental.bike_price}/day</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{rental.bike_type}</td>
                      <td className="px-6 py-4 text-gray-600">{new Date(rental.rental_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle(rental.status)}`}>
                          {statusLabel(rental)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {rental.return_date ? new Date(rental.return_date).toLocaleDateString() : '—'}
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
