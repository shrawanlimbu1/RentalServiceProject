// Importing React hooks and routing components
import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Navbar component - responsive navigation bar for the entire app
export default function Navbar() {
  // State to control mobile menu visibility (open/closed)
  const [open, setOpen] = useState(false);
  
  // Get current user and logout function from AuthContext
  const authContext = useContext(AuthContext);
  const { user, logout } = authContext || { user: null, logout: () => {} };

  return (
    // Main navigation container with gradient background and glass effect
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white w-full shadow-2xl backdrop-blur-lg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl animate-bounce"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
      
      {/* Container for navbar content with max width and centering */}
      <div className="relative max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* App logo/brand name with animation */}
        <div className="flex items-center space-x-3 group">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 group-hover:rotate-12">
            <span className="text-2xl animate-bounce">🚴</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent hover:scale-105 transition-transform cursor-pointer">
            BikeRental
          </h2>
        </div>

        {/* Desktop navigation menu - hidden on mobile devices */}
        <div className="hidden md:flex gap-2 text-lg items-center">
          <Link to="/" className="px-4 py-2 rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
            🏠 Home
          </Link>
          {/* Only show About for non-admin users */}
          {(!user || user.role !== 'admin') && (
            <Link to="/about" className="px-4 py-2 rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
              ℹ️ About
            </Link>
          )}
          
          {/* Show different links based on user login status */}
          {user ? (
            <>
              {/* Show admin link only if user is admin */}
              {user.role === 'admin' ? (
                <Link to="/admin" className="px-4 py-2 rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  🔧 Admin Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/dashboard" className="px-4 py-2 rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    📊 Dashboard
                  </Link>
                  <Link to="/my-rentals" className="px-4 py-2 rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    🚴 My Rentals
                  </Link>
                </>
              )}
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                <span className="text-yellow-200 font-semibold">👋 {user.full_name}</span>
              </div>
              <button 
                onClick={logout} 
                className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-2 rounded-xl hover:from-red-600 hover:to-pink-600 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                🔑 Login
              </Link>
              <Link to="/register" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-2 rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                ✨ Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle button - only visible on mobile */}
        <button 
          onClick={() => setOpen(!open)}
          className="md:hidden focus:outline-none bg-white/20 backdrop-blur-sm p-3 rounded-xl hover:bg-white/30 transition-all duration-300 hover:scale-110"
        >
          <div className="relative w-6 h-6">
            <span className={`absolute block w-6 h-0.5 bg-white transform transition-all duration-300 ${open ? 'rotate-45 translate-y-2.5' : 'translate-y-0'}`}></span>
            <span className={`absolute block w-6 h-0.5 bg-white transform transition-all duration-300 translate-y-2.5 ${open ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`absolute block w-6 h-0.5 bg-white transform transition-all duration-300 ${open ? '-rotate-45 translate-y-2.5' : 'translate-y-5'}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile dropdown menu - only shows when 'open' is true */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-gradient-to-b from-black/20 to-black/40 backdrop-blur-xl border-t border-white/20 flex flex-col gap-3 px-6 py-6">
          {/* Each link closes the mobile menu when clicked */}
          <Link to="/" onClick={() => setOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <span>🏠</span><span>Home</span>
          </Link>
          {/* Only show About for non-admin users */}
          {(!user || user.role !== 'admin') && (
            <Link to="/about" onClick={() => setOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <span>ℹ️</span><span>About</span>
            </Link>
          )}
          
          {/* Show different links based on user login status */}
          {user ? (
            <>
              {/* Show admin link only if user is admin */}
              {user.role === 'admin' ? (
                <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <span>🔧</span><span>Admin Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <span>📊</span><span>Dashboard</span>
                  </Link>
                  <Link to="/my-rentals" onClick={() => setOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <span>🚴</span><span>My Rentals</span>
                  </Link>
                </>
              )}
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30 text-center">
                <span className="text-yellow-200 font-semibold">👋 Hello, {user.full_name}</span>
              </div>
              <button onClick={() => { logout(); setOpen(false); }} className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-xl hover:from-red-600 hover:to-pink-600 font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2">
                <span>🚪</span><span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <span>🔑</span><span>Login</span>
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 p-3 rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2">
                <span>✨</span><span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
