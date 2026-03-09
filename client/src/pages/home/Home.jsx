import React, { useState,useEffect } from 'react';
import Header from '../../components/header/Header';
import Sidebar from '../../components/sidebar/Sidebar';
import BannerSlider from '../../components/banner/BannerSlider';
import Footer from '../../components/footer/Footer';
import CategorySlider from '../../components/category/CategorySlider';

const Home = () => {
  // State for controlling sidebar popup and active tab
  const [showPopup, setShowPopup] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState('আমার অ্যাকাউন্ট');

  useEffect(() => {
    // Scroll to top on initial load
    window.scrollTo(0, 0);
  }, []);
  return (
    <section className="min-h-screen font-anek bg-white">
      {/* Header with dark glass morphism effect */}
      <Header 
        className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-700"
        showPopup={showPopup}
        setShowPopup={setShowPopup}
        activeLeftTab={activeLeftTab}
        setActiveLeftTab={setActiveLeftTab}
      />
      
      <div className="flex">
        {/* Fixed Sidebar with dark glass morphism */}
        <div className="hidden xl:block">
          <Sidebar 
            showPopup={showPopup}
            setShowPopup={setShowPopup}
            activeLeftTab={activeLeftTab}
            setActiveLeftTab={setActiveLeftTab}
          />
        </div>

        {/* Scrollable Content */}
        <div className="main-box ml-0 xl:ml-[250px] w-full pt-5 md:pt-8">
          {/* Main content container */}
          <div className="mx-auto md:px-4">
            {/* Banner with dark theme styling */}
            <div className="rounded-xl overflow-hidden mb-8">
              <BannerSlider />
            </div>
            
            {/* Mobile Sidebar Popup (shown when showPopup is true) */}
            {showPopup && (
              <div className="fixed inset-0 z-[10000] xl:hidden">
                <Sidebar 
                  showPopup={showPopup}
                  setShowPopup={setShowPopup}
                  activeLeftTab={activeLeftTab}
                  setActiveLeftTab={setActiveLeftTab}
                />
              </div>
            )}
          </div>
          
          {/* Dark themed footer */}
          <Footer className="mt-12 bg-gray-900/90 border-t border-gray-700" />
        </div>
      </div>
    </section>
  );
};

export default Home;