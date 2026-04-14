import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">About BikeRental</h1>
          <p className="text-xl text-gray-600">Your trusted partner for bike rentals</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-200">
          <div className="text-center mb-8">
            <span className="text-7xl">🚴</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-10">
            We provide high-quality bikes for rent to make your journey comfortable and enjoyable. 
            Whether you're exploring the city or going on an adventure, we have the perfect bike for you.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Service</h3>
              <p className="text-gray-600">Quick and easy rental process</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
              <div className="text-5xl mb-4">👍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Bikes</h3>
              <p className="text-gray-600">Well-maintained premium bikes</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-100">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Affordable</h3>
              <p className="text-gray-600">Best prices in the market</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;