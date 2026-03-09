import React, { useState, useEffect } from 'react';
import { FaTimes, FaStar, FaDownload, FaApple, FaAndroid, FaMobile } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import logo from "../../assets/genzz.jpg";

const APK_FILE="https://docs.google.com/uc?export=download&id=1oj3ReyGd6J4uK_8nByYzZBbzA-BVYb64";
const MobileAppBanner = ({ isSidebar = false, onCloseSidebar }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  

    const downloadFileAtURL = (url) => {
        const fileName = url.split("/").pop();
        const aTag = document.createElement("a");
        aTag.href = url;
        aTag.setAttribute("download", fileName);
        document.body.appendChild(aTag);
        aTag.click();
        aTag.remove();
    };
    
  useEffect(() => {
    const checkMobileAndVisibility = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Check if banner was dismissed
      const dismissedUntil = localStorage.getItem('appBannerDismissedUntil');
      const isDismissed = dismissedUntil && new Date().getTime() < parseInt(dismissedUntil);
      
      // Only show top banner on mobile if not dismissed
      if (mobile && !isDismissed) {
        setIsVisible(true);
        // Add slight delay for mount to trigger animation
        setTimeout(() => setIsMounted(true), 50);
      }
    };

    checkMobileAndVisibility();
    window.addEventListener('resize', checkMobileAndVisibility);
    return () => window.removeEventListener('resize', checkMobileAndVisibility);
  }, []);

  const dismissBanner = (days) => {
    const dismissUntil = new Date().getTime() + (days * 24 * 60 * 60 * 1000);
    localStorage.setItem('appBannerDismissedUntil', dismissUntil.toString());
  };

  const handleClose = () => {
    setIsMounted(false);
    setTimeout(() => {
      setIsVisible(false);
      // Hide for 2 days when close icon is clicked
      dismissBanner(2);
    }, 300); // Match this with transition duration
  };

  // If used as sidebar menu item (desktop)
  if (isSidebar) {
    return (
      <div className="border-t border-gray-700 pt-4 mt-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-700 shadow-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
              <FaMobile className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Mobile App</h3>
              <div className="flex items-center space-x-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar key={star} className="text-yellow-400 text-xs" />
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => handleDownload('ios')}
              className="w-full bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 border border-gray-600 shadow-lg hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0 group"
            >
              <FaApple className="text-xl group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm font-semibold">iOS App</span>
            </button>
            
            <button
              onClick={() => handleDownload('android')}
              className="w-full bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 border border-gray-600 shadow-lg hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0 group"
            >
              <FaAndroid className="text-xl group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm font-semibold">Android App</span>
            </button>
          </div>
        </div>
      </div>
    );
  }


  return null;
};

export default MobileAppBanner;