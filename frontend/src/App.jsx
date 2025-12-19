import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import MyRentals from "./pages/MyRentals";
import BikesCatalog from "./pages/BikesCatalog";
import UserProfile from "./pages/UserProfile";
import Recommendations from "./pages/Recommendations";

// Main App component - sets up routing and context providers

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/my-rentals" element={<MyRentals />} />
        <Route path="/bikes" element={<BikesCatalog />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
        
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
