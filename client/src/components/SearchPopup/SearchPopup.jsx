import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

const SearchPopup = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProviders = async () => {
      if (!isOpen) return;
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/all-providers`);
        console.log(response.data)
        if (response.data) {
          setProviders(response.data);
          setFilteredProviders(response.data);
        }
      } catch (err) {
        console.error("Error fetching providers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, [isOpen]);

  useEffect(() => {
    const filtered = providers.filter(p => 
      p.providerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProviders(filtered);
  }, [searchTerm, providers]);

  const handleProviderClick = (provider) => {
    // Get the provider name for the query parameter
    const providerName = provider.providerName || provider.name;
    
    // Encode the provider name for URL safety
    const encodedProviderName = encodeURIComponent(providerName);
    
    // Navigate to provider-games page with provider name as query parameter
    navigate(`/provider-games?provider=${encodedProviderName}`);
    
    // Close the popup after navigation
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center bg-[#CCF2FF] overflow-y-auto"
      onClick={onClose}
    >
      {/* Title Header - Smaller font */}
      <div className="w-full py-8 text-center">
        <h1 className="text-[#4A707A] text-2xl md:text-3xl font-light tracking-wide">
          All of our Game Providers
        </h1>
      </div>

      {/* Main Container - Adjusted padding and width */}
      <div 
        className="w-[95%] max-w-3xl bg-[#F2F2F2] rounded-[30px] p-6 mb-8 shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Rounded Search Bar - Smaller elements */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <FaSearch className="text-lg" />
          </div>
          <input
            type="text"
            placeholder="Search a provider"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pl-12 pr-5 bg-white rounded-full  border-[1px] border-gray-200 text-sm text-gray-700 focus:outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] placeholder:text-gray-300"
          />
        </div>

        {/* Providers Grid - Better box sizing */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {loading ? (
            <div className="col-span-full text-center py-6 text-sm text-gray-400">Loading...</div>
          ) : (
            filteredProviders.map((provider, index) => (
              <div 
                key={provider.id || index}
                onClick={() => handleProviderClick(provider)}
                className="bg-white rounded-lg p-3 flex items-center justify-center aspect-square shadow-sm hover:scale-105 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <img
                  src={`${API_BASE_URL}/images/${provider.imageUrl}`}
                  alt={provider.providerName || provider.name}
                  className="w-[80px] object-contain"
                />
              </div>
            ))
          )}
        </div>

        {filteredProviders.length === 0 && !loading && (
          <div className="text-center py-6 text-sm text-gray-400">No providers found.</div>
        )}
      </div>

      {/* Close Button - Smaller */}
      <button 
        onClick={onClose}
        className="fixed top-4 right-4 text-xl text-gray-500 hover:text-gray-800 transition-colors"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

export default SearchPopup;