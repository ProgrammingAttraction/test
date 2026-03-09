import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

const SearchPopup = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(false);

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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center bg-[#CCF2FF] overflow-y-auto"
      onClick={onClose}
    >
      {/* Title Header */}
      <div className="w-full py-12 text-center">
        <h1 className="text-[#4A707A] text-4xl font-light tracking-wide">
          All of ours Game Provider
        </h1>
      </div>

      {/* Main Container */}
      <div 
        className="w-[95%] max-w-2xl bg-[#F2F2F2] rounded-[40px] p-8 mb-10 shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Rounded Search Bar */}
        <div className="relative mb-10">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
            <FaSearch className="text-2xl" />
          </div>
          <input
            type="text"
            placeholder="Search a provider"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-4 pl-16 pr-6 bg-white rounded-full text-lg text-gray-600 focus:outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] placeholder:text-gray-300"
          />
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-10 text-gray-400">Loading...</div>
          ) : (
            filteredProviders.map((provider, index) => (
              <div 
                key={provider.id || index}
                className="bg-white rounded-lg p-4 flex items-center justify-center h-20 shadow-sm hover:scale-105 transition-transform cursor-pointer"
              >
                <img
                  src={`${API_BASE_URL}/images/${provider.imageUrl}`}
                  alt={provider.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Logo'; }}
                />
              </div>
            ))
          )}
        </div>

        {filteredProviders.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-400">No providers found.</div>
        )}
      </div>

      {/* Close Button (Optional Overlay) */}
      <button 
        onClick={onClose}
        className="fixed top-4 right-6 text-2xl text-gray-500 hover:text-gray-800"
      >
        ✕
      </button>
    </div>
  );
};

export default SearchPopup;