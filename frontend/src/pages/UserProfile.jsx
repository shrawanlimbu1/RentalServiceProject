import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useFavourites } from '../hooks/useFavourites';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const authContext = useContext(AuthContext);
  const { user, login } = authContext || { user: null, login: () => {} };
  const navigate = useNavigate();
  const { favouriteIds, toggleFavourite } = useFavourites(user);
  const [favourites, setFavourites] = useState([]);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', license_number: '', license_photo: '' });
  const [savedPhoto, setSavedPhoto] = useState('');

  useEffect(() => {
    if (user) {
      axios.get(`http://localhost:5000/api/users?id=${user.id}`)
        .then(res => {
          const fresh = res.data;
          setSavedPhoto(fresh.license_photo || '');
          setFormData({
            full_name: fresh.full_name || '',
            email: fresh.email || '',
            license_number: fresh.license_number || '',
            license_photo: fresh.license_photo || ''
          });
        })
        .catch(() => {
          setFormData({
            full_name: user.full_name || '',
            email: user.email || '',
            license_number: user.license_number || '',
            license_photo: ''
          });
        });
      axios.get(`http://localhost:5000/api/favourites/${user.id}`)
        .then(res => setFavourites(res.data))
        .catch(() => {});
    }
  }, [user]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image too large (max 2MB)'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, license_photo: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        license_number: formData.license_number,
        license_photo: formData.license_photo || null
      };
      await axios.put(`http://localhost:5000/api/users/${user.id}`, payload, {
        headers: { 'Content-Type': 'application/json' },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });
      login({ ...user, ...payload }, localStorage.getItem('token'));
      setSavedPhoto(formData.license_photo || '');
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      license_number: user.license_number || '',
      license_photo: savedPhoto
    });
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Please login to view your profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">

          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">{user.full_name?.charAt(0) || 'U'}</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors font-medium"
              >
                Edit
              </button>
            )}
          </div>

          {/* Edit form */}
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input
                  type="text"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="e.g. BA-12-PA-1234"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">Required to book a bike</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-gray-300 file:text-sm file:bg-white file:text-gray-700 hover:file:bg-gray-50"
                />
                {formData.license_photo && (
                  <img src={formData.license_photo} alt="License preview" className="mt-2 h-24 rounded border border-gray-200 object-cover" />
                )}
                <p className="text-xs text-gray-400 mt-1">Upload a photo of your license (max 2MB)</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* View mode */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Email</p>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">License Number</p>
                  {user.license_number ? (
                    <p className="text-sm font-medium text-gray-900">{user.license_number}</p>
                  ) : (
                    <p className="text-sm text-red-500">Not set — required to book</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Role</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{user.role}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">License Photo</p>
                {savedPhoto ? (
                  <img src={savedPhoto} alt="License" className="h-28 rounded border border-gray-200 object-cover" />
                ) : (
                  <p className="text-sm text-gray-400">No photo uploaded</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Favourites section */}
      {!editing && favourites.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mt-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">My Favourite Bikes</h2>
          <div className="space-y-3">
            {favourites.map(bike => (
              <div key={bike.bike_id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 hover:border-gray-300 transition">
                {bike.image_url ? (
                  <img
                    src={bike.image_url.startsWith('data:') || bike.image_url.startsWith('http') ? bike.image_url : `http://localhost:5000${bike.image_url}`}
                    alt={bike.name}
                    className="w-12 h-12 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{bike.name}</p>
                  <p className="text-xs text-gray-400">{bike.type} &middot; Rs {bike.price_per_hour}/day</p>
                </div>
                <button
                  onClick={() => {
                    toggleFavourite(bike.bike_id);
                    setFavourites(prev => prev.filter(f => f.bike_id !== bike.bike_id));
                  }}
                  className="p-1.5 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="#ef4444" stroke="#ef4444" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/recommendations')}
            className="mt-4 w-full py-2 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            View Recommendations
          </button>
        </div>
      )}

    </div>
  );
};

export default UserProfile;
