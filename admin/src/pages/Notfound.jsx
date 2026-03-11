import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full font-bai bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated 404 text */}
        <div className="relative mb-8">
          <span className="text-9xl font-bold text-indigo-400 opacity-20">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-5xl font-bold text-indigo-600">Page Not Found</h1>
          </div>
        </div>
        
        <p className="text-lg text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Buttons with subtle animation */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all hover:-translate-y-1 shadow-md hover:shadow-lg"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg border-2 border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 transition-all hover:-translate-y-1"
          >
            Home Page
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="mt-12 flex justify-center space-x-2">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="h-2 w-2 bg-indigo-400 rounded-full opacity-75"
              style={{ animation: `pulse 2s infinite ${i * 0.2}s` }}
            />
          ))}
        </div>
        
        <style jsx>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.75; }
            50% { transform: scale(1.5); opacity: 0.25; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default NotFound;