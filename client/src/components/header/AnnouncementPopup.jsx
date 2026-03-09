import React, { useState, useEffect } from 'react';
import { IoClose, IoMenu } from "react-icons/io5";

// Placeholder icons for the menu items
import { FaCalendarAlt, FaStar, FaGhost, FaGift } from 'react-icons/fa';

// --- Static Data for Navigation Tabs (Using Bengali text) ---
const navTabs = [
  { id: 'member-day', label: 'Member Day', icon: FaCalendarAlt, labelBn: 'সদস্য দিবস 🎯', description: 'বিশেষ অফার ও সুযোগ' },
  { id: 'promotions', label: 'ইভেন্ট আপডেট', icon: FaStar, labelBn: 'ইভেন্ট আপডেট 🎪', description: 'সকল অফার' },
  { id: 'new-promos', label: 'গুরুত্বপূর্ণ ঘোষণা', icon: FaStar, labelBn: 'গুরুত্বপূর্ণ ঘোষণা 📢', description: 'নতুন আপডেট' },
];

// --- Main Component ---
const AnnouncementPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState('member-day');
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Check if popup was closed in the last 3 days
  useEffect(() => {
    const popupClosedAt = localStorage.getItem('announcementPopupClosedAt');
    if (popupClosedAt) {
      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
      const shouldShowAgain = Date.now() - parseInt(popupClosedAt) > threeDaysInMs;
      setShowPopup(shouldShowAgain);
    } else {
      setShowPopup(true);
    }
  }, []);

  const handleClose = () => {
    setShowPopup(false);
    localStorage.setItem('announcementPopupClosedAt', Date.now().toString());
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsNavOpen(false);
  };

  // Close navigation when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isNavOpen && !event.target.closest('.nav-sidebar')) {
        setIsNavOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isNavOpen]);

  // --- Render Content for the Main Tab (The Banner) ---
  const renderTabContent = (tabId) => {
    if (tabId !== 'member-day') {
      const tab = navTabs.find(t => t.id === tabId);
      return (
        <div className="flex flex-col items-center justify-center h-full text-white/70 p-4 md:p-6 lg:p-10 text-center">
          <div className="text-3xl md:text-4xl mb-3 md:mb-4">🎁</div>
          <p className="text-lg md:text-xl lg:text-2xl mb-2 font-bold text-cyan-300">{tab?.labelBn}</p>
          <p className="text-base md:text-lg mb-3 md:mb-4">{tab?.description}</p>
          <p className="text-xs md:text-sm bg-black/30 p-3 md:p-4 rounded-lg">এই সেকশনে কোনো ঘোষণা নেই। পরে আবার দেখুন! 🔄</p>
        </div>
      );
    }

    // --- Content for the main 'Member Day' tab ---
    return (
      <div className="p-0 flex flex-col h-full bg-gradient-to-br from-cyan-900 to-cyan-950">
        <div className="flex-grow flex flex-col overflow-y-auto">
          {/* Main Banner Image Container */}
          <div className="w-full relative shadow-inner shadow-black/50 p-2 md:p-3 lg:p-4">
            <div className="relative w-full h-auto rounded-lg shadow-2xl border-2 border-cyan-500 overflow-hidden">
              <img
                src={'https://i.ibb.co.com/Y7V1v7xx/Gemini-Generated-Image-ahudkaahudkaahud-1.png'}
                alt="CK44 Member Day Promotion"
                className="w-full h-auto object-cover min-h-[270px] md:min-h-[300px]"
              />
              {/* Enhanced Bengali Text Overlay - Responsive */}
              <div className="absolute left-2 md:left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-white z-10 max-w-[50%] md:max-w-[45%]">
                <div className="rounded-xl">
                  {/* Bonus Badge */}
                  <div className="inline-block bg-gradient-to-r from-cyan-400 to-cyan-600 text-black text-xs md:text-sm font-bold px-2 py-1 md:px-3 md:py-1 rounded-full mb-2 md:mb-3 animate-pulse">
                    🎉 বিশেষ বোনাস! 🎉
                  </div>
                  <h2 className="text-base md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 text-cyan-300 leading-tight">
                    প্রথম জমাতে পাবেন 🤑
                  </h2>
                  <div className="bg-black/40 p-2 md:p-3 rounded-lg mb-2 md:mb-3 border border-cyan-500/30">
                    <p className="text-lg md:text-2xl lg:text-3xl font-extrabold text-white leading-tight flex items-center gap-1 md:gap-2 flex-wrap">
                      <span className="text-cyan-400">💰</span>
                      5% বোনাস!
                      <span className="text-cyan-400">💰</span>
                    </p>
                    <p className="text-xs md:text-sm text-cyan-200 mt-1"> কাস্টমার সাপোর্ট এ যোগাযোগ করুন 🚀</p>
                  </div>
                  <h3 className="text-sm md:text-lg lg:text-xl font-extrabold mb-1 md:mb-2 text-white leading-tight flex items-center gap-1 md:gap-2">
                    <span className="text-cyan-400">✅</span>
                    এখনই নিবন্ধন করুন
                  </h3>
                  {/* Additional Benefits */}
                  <div className="mt-2 md:mt-3 space-y-1 md:space-y-2">
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-cyan-300">
                      <span>⭐</span>
                      <span>দ্রুত উত্তোলন ব্যবস্থা</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-cyan-200">
                      <span>🎯</span>
                      <span>২৪/৭ কাস্টমার সাপোর্ট</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-cyan-100">
                      <span>🏆</span>
                      <span>বিশেষ রিওয়ার্ড প্রোগ্রাম</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Bonus Tag on Top Right - Responsive */}
              <div className="absolute top-2 md:top-3 lg:top-4 right-2 md:right-3 lg:right-4 bg-gradient-to-r from-cyan-500 to-cyan-700 text-white text-xs md:text-sm font-bold px-2 py-1 md:px-3 md:py-2 rounded-full shadow-lg transform rotate-3 md:rotate-6 animate-bounce">
                HOT 🔥
              </div>
            </div>
          </div>
          {/* Additional Information Section - Responsive Grid */}
          <div className="p-3 md:p-4 lg:p-6 bg-gradient-to-r from-cyan-900 to-cyan-950 border-t border-cyan-600">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 lg:gap-4 text-center">
              <div className="bg-black/30 p-2 md:p-3 rounded-lg border border-cyan-500/20">
                <div className="text-xl md:text-2xl mb-1 md:mb-2">⚡</div>
                <h4 className="font-bold text-cyan-300 text-xs md:text-sm">দ্রুত রেজিস্ট্রেশন</h4>
                <p className="text-xs text-white/80">কয়েক সেকেন্ডে অ্যাকাউন্ট খুলুন</p>
              </div>
              <div className="bg-black/30 p-2 md:p-3 rounded-lg border border-cyan-500/20">
                <div className="text-xl md:text-2xl mb-1 md:mb-2">🛡️</div>
                <h4 className="font-bold text-cyan-300 text-xs md:text-sm">সুরক্ষিত লেনদেন</h4>
                <p className="text-xs text-white/80">১০০% নিরাপদ ব্যাংকিং</p>
              </div>
              <div className="bg-black/30 p-2 md:p-3 rounded-lg border border-cyan-500/20">
                <div className="text-xl md:text-2xl mb-1 md:mb-2">🎁</div>
                <h4 className="font-bold text-cyan-300 text-xs md:text-sm">বোনাস উপহার</h4>
                <p className="text-xs text-white/80">প্রতিদিন নতুন অফার</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-[10003] flex items-center justify-center bg-[rgba(0,0,0,0.8)] bg-opacity-90 p-2 sm:p-3 md:p-4 animate-fadeIn">
      <div className="w-full max-w-full md:max-w-4xl lg:max-w-5xl md:h-auto max-h-[95vh] bg-gradient-to-br from-cyan-900 to-cyan-950 rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border-2 border-cyan-500 flex flex-col md:flex-row relative animate-scaleIn">
        {/* --- Top Bar for Mobile/Header --- */}
        <div className="md:hidden flex justify-between items-center bg-gradient-to-r from-cyan-950 to-cyan-900 p-3 border-b border-cyan-600">
          <div className="flex items-center gap-2">
            <div className="text-cyan-400 text-xl md:text-2xl">📢</div>
            <h2 className="text-cyan-400 text-lg md:text-xl font-extrabold tracking-wide">
              ঘোষণা ও অফার
            </h2>
          </div>
          <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            className="text-cyan-400 hover:text-white md:flex hidden transition-colors p-2 bg-black/30 rounded-lg"
          >
            {isNavOpen ? <IoClose className="text-xl md:text-2xl" /> : <IoMenu className="text-xl md:text-2xl" />}
          </button>
        </div>
        {/* Enhanced Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 md:top-3 md:right-3 z-50 text-cyan-400 hover:text-white transition-all cursor-pointer p-1 md:p-2 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-700 shadow-lg hover:scale-110 transform duration-200"
        >
          <IoClose className="text-lg md:text-xl font-bold" />
        </button>
        {/* --- Mobile Navigation Sidebar --- */}
        {isNavOpen && (
          <div className="md:hidden nav-sidebar absolute top-full left-0 right-0 z-40 bg-gradient-to-b from-cyan-950 to-cyan-900 border-t border-cyan-600 p-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4 p-3 bg-black/30 rounded-lg border border-cyan-500/30">
              <div className="text-2xl text-cyan-400">🎯</div>
              <div>
                <h3 className="text-cyan-400 font-bold text-base">বিশেষ অফার</h3>
                <p className="text-white/70 text-xs">নতুন সুযোগ</p>
              </div>
            </div>
            <div className="space-y-2">
              {navTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white shadow-lg'
                      : 'bg-black/30 text-white/80 hover:bg-black/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className={`text-base ${activeTab === tab.id ? 'text-white' : 'text-cyan-400'}`} />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{tab.labelBn}</div>
                      <div className="text-xs opacity-80">{tab.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {/* Footer in Mobile Sidebar */}
            <div className="mt-4 pt-4 border-t border-cyan-600/50">
              <div className="text-center p-2 bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-lg text-white text-xs font-bold">
                🎊 আজই জয়েন করুন! 🎊
              </div>
            </div>
          </div>
        )}
        {/* --- Right Content Area (Main body where the banner is displayed) --- */}
        <div className="flex-grow overflow-y-auto relative bg-gradient-to-br from-cyan-900 to-cyan-950">
          {renderTabContent(activeTab)}
          {/* Enhanced Shadow effect */}
          <div className="absolute top-0 right-0 h-full w-4 md:w-6 bg-gradient-to-l from-black/40 to-transparent pointer-events-none"></div>
        </div>
        {/* Navigation Sidebar for Desktop */}
        <div className="hidden md:flex flex-col w-56 lg:w-64 bg-gradient-to-b from-cyan-950 to-cyan-900 border-l border-cyan-600 p-3 lg:p-4">
          <div className="flex items-center gap-3 mb-4 lg:mb-6 p-3 bg-black/30 rounded-lg border border-cyan-500/30">
            <div className="text-2xl lg:text-3xl text-cyan-400">🎯</div>
            <div>
              <h3 className="text-cyan-400 font-bold text-base lg:text-lg">বিশেষ অফার</h3>
              <p className="text-white/70 text-xs lg:text-sm">নতুন সুযোগ</p>
            </div>
          </div>
          <div className="space-y-2">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full text-left p-2 lg:p-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white shadow-lg transform scale-105'
                    : 'bg-black/30 text-white/80 hover:bg-black/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 lg:gap-3">
                  <tab.icon className={`text-base lg:text-lg ${activeTab === tab.id ? 'text-white' : 'text-cyan-400'}`} />
                  <div className="flex-1">
                    <div className="font-semibold text-xs lg:text-sm">{tab.labelBn}</div>
                    <div className="text-xs opacity-80">{tab.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {/* Footer in Sidebar */}
          <div className="mt-auto pt-3 lg:pt-4 border-t border-cyan-600/50">
            <div className="text-center p-2 lg:p-3 bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-lg text-white text-xs lg:text-sm font-bold">
              🎊 আজই জয়েন করুন! 🎊
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementPopup;