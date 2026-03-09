import React, { useState, useEffect } from 'react';
import { FaGift, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const NoticeMarquee = () => {
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(true);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Fetch notice data from API
  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const response = await axios.get(`${base_url}/api/notice`);
        if (response.data.success && response.data.data) {
          setNotice(response.data.data);
        } else {
          setError("No notice available");
        }
      } catch (err) {
        console.error("Error fetching notice:", err);
        setError("Error loading notice. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, []);

  if (!visible) return null;

  if (loading) {
    return (
      <div className="w-full bg-gray-800 text-gray-300 flex items-center justify-between rounded-lg px-4 py-2 mt-4 shadow-lg border-l-4 border-cyan-500 animate-pulse">
        <div className="flex items-center gap-2">
          <span className="text-sm">📢</span>
          <span className="text-sm">Loading notice...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-gray-800 text-gray-300 flex items-center justify-between rounded-lg px-4 py-2 mt-4 shadow-lg border-l-4 border-red-500">
        <div className="flex items-center gap-2">
          <span className="text-sm">📢</span>
          <span className="text-sm">{error}</span>
        </div>
        <button 
          onClick={() => setVisible(false)} 
          className="text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white mt-5 text-gray-700 flex items-center justify-between rounded-sm md:rounded-lg px-4 py-1.5 md:py-2 mt-3 md:mt-4 relative overflow-hidden border border-gray-200">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-0 left-0 w-4 h-4 rounded-full bg-cyan-500/30 animate-bounce"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-cyan-400/20 animate-pulse"></div>
      </div>
      
      {/* Left icon section */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <span className="text-sm sm:text-base animate-pulse">📢</span>
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></div>
        </div>
        <span className="hidden sm:inline text-xs text-cyan-300 font-medium">নোটিশ :</span>
      </div>
      
      {/* Marquee content */}
      <div className="overflow-hidden w-full mx-2">
        <div className="animate-marquee whitespace-nowrap">
          <marquee className="inline-flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-gray-700">
              {notice && notice.length > 0 ? notice[0].content : "No notice available"}
            </span>
          </marquee>
        </div>
      </div>
    </div>
  );
};

export default NoticeMarquee;