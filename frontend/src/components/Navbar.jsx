import { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const authContext = useContext(AuthContext);
  const { user, logout } = authContext || { user: null, logout: () => {} };
  const location = useLocation();

  const linkClass = (path) =>
    `px-3 py-2 rounded text-sm font-medium transition-colors ${
      location.pathname === path
        ? "bg-gray-100 text-gray-900"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">VehicleRental</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={linkClass("/")}>Home</Link>
            {(!user || user.role !== "admin") && (
              <Link to="/about" className={linkClass("/about")}>About</Link>
            )}
            {user ? (
              <>
                {user.role === "admin" ? (
                  <Link to="/admin" className={linkClass("/admin")}>Dashboard</Link>
                ) : (
                  <>
                    <Link to="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
                    <Link to="/recommendations" className={linkClass("/recommendations")}>Recommendations</Link>
                    <Link to="/my-rentals" className={linkClass("/my-rentals")}>My Rentals</Link>
                    <Link to="/profile" className={linkClass("/profile")}>Profile</Link>
                  </>
                )}
                <span className="ml-2 text-sm text-gray-500">{user.full_name}</span>
                <button
                  onClick={logout}
                  className="ml-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={linkClass("/login")}>Login</Link>
                <Link
                  to="/register"
                  className="ml-1 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 flex flex-col gap-1">
          <Link to="/" onClick={() => setOpen(false)} className={linkClass("/")}>Home</Link>
          {(!user || user.role !== "admin") && (
            <Link to="/about" onClick={() => setOpen(false)} className={linkClass("/about")}>About</Link>
          )}
          {user ? (
            <>
              {user.role === "admin" ? (
                <Link to="/admin" onClick={() => setOpen(false)} className={linkClass("/admin")}>Dashboard</Link>
              ) : (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className={linkClass("/dashboard")}>Dashboard</Link>
                  <Link to="/recommendations" onClick={() => setOpen(false)} className={linkClass("/recommendations")}>Recommendations</Link>
                  <Link to="/my-rentals" onClick={() => setOpen(false)} className={linkClass("/my-rentals")}>My Rentals</Link>
                  <Link to="/profile" onClick={() => setOpen(false)} className={linkClass("/profile")}>Profile</Link>
                </>
              )}
              <div className="pt-2 border-t border-gray-100 mt-1">
                <p className="text-sm text-gray-500 mb-2">{user.full_name}</p>
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className={linkClass("/login")}>Login</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded text-center">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
