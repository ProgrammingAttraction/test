import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FreespinIndicator  = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showSpinner, setShowSpinner] = useState(false);
  const [freespinData, setFreespinData] = useState(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Function to handle API calls with error handling
  const handleApiCall = async (apiCall) => {
    setIsLoading(true);
    setMessage('');
    try {
      const response = await apiCall();
      return response.data;
    } catch (error) {
      setMessage(error.response?.data?.message || 'An error occurred');
      console.error('API Error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get available freespin bets
  const getFreespinBets = async (game_uuid, currency) => {
    return await handleApiCall(() => 
      axios.get(`${base_url}/api/games/freespins/bets`, {
        params: { game_uuid, currency }
      })
    );
  };

  // Set a freespin campaign
  const setFreespinCampaign = async (campaignData) => {
    return await handleApiCall(() => 
      axios.post(`${base_url}/api/games/freespins/set`, campaignData)
    );
  };

  // Get freespin campaign
  const getFreespinCampaign = async (freespin_id) => {
    return await handleApiCall(() => 
      axios.get(`${base_url}/api/games/freespins/get`, {
        params: { freespin_id }
      })
    );
  };

  // Cancel freespin campaign
  const cancelFreespinCampaign = async (freespin_id) => {
    return await handleApiCall(() => 
      axios.post(`${base_url}/api/games/freespins/cancel`, { freespin_id })
    );
  };

  // Handle gift box click
  const handleGiftBoxClick = async () => {
    if (isLoading) return;
    
    setIsOpen(true);
    setShowSpinner(true);
    setNotificationVisible(true);
    
    // Example: Get available freespin bets for a game
    const bets = await getFreespinBets('game-uuid-here', 'USD');
    
    if (bets && bets.success) {
      // Example: Set a freespin campaign with the first available bet
      if (bets.data && bets.data.length > 0) {
        const bet = bets.data[0];
        const campaignData = {
          player_id: 'user123',
          player_name: 'John Doe',
          currency: 'USD',
          quantity: 10,
          valid_from: Math.floor(Date.now() / 1000),
          valid_until: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days from now
          freespin_id: `fs_${Date.now()}`,
          bet_id: bet.bet_id,
          denomination: bet.denomination,
          game_uuid: '82aa1e520f7c6c0550d2b00fccfd8a39d3b6678f'
        };
        
        const result = await setFreespinCampaign(campaignData);
        
        if (result && result.success) {
          setMessage('Congratulations! You received 10 free spins!');
          setFreespinData(result.data);
        }
      }
    }
    
    setShowSpinner(false);
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      setNotificationVisible(false);
      setTimeout(() => setIsOpen(false), 300);
    }, 5000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Gift Box Icon */}
      <div 
        className={`relative w-16 h-16 cursor-pointer transition-all duration-300 transform ${
          isOpen ? 'scale-110' : 'hover:scale-110'
        } ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}
        onClick={handleGiftBoxClick}
      >
        {/* Gift Box Body */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-md shadow-lg"></div>
        
        {/* Gift Box Lid */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-14 h-4 bg-gradient-to-br from-red-600 to-red-700 rounded-md shadow-md"></div>
        
        {/* Ribbon */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-yellow-300 rounded-full"></div>
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-1 bg-yellow-300 rounded-full"></div>
        
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {/* Notification Popup */}
      {isOpen && (
        <div className={`absolute bottom-20 right-0 w-72 bg-white rounded-lg shadow-xl p-4 transition-opacity duration-300 ${
          notificationVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                </svg>
              </div>
            </div>
            <div className="ml-3">
              {showSpinner ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <p className="text-gray-700 font-medium">Checking for rewards...</p>
                </div>
              ) : (
                <>
                  {message && <p className="text-gray-800 font-medium">{message}</p>}
                  {freespinData && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Free Spins: {freespinData.quantity}</p>
                      <p>Valid until: {new Date(freespinData.valid_until * 1000).toLocaleDateString()}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreespinIndicator ;