import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">About VehicleRental</h1>
        <p className="text-gray-500 mb-10">Your trusted partner for vehicle rentals</p>

        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            We provide well-maintained vehicles for rent to make your journey comfortable and enjoyable.
            Whether you're exploring the city or heading out on an adventure, we have the right vehicle for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Fast Service</h3>
            <p className="text-sm text-gray-500">Quick and easy rental process from start to finish.</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Quality Vehicles</h3>
            <p className="text-sm text-gray-500">All vehicles are regularly serviced and well-maintained.</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Affordable Rates</h3>
            <p className="text-sm text-gray-500">Competitive pricing with no hidden fees.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
