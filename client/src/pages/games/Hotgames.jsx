import React,{useEffect,useState} from 'react';
import Header from '../../components/header/Header';
import Sidebar from '../../components/sidebar/Sidebar';
import BannerSlider from '../../components/banner/BannerSlider';
import Footer from '../../components/footer/Footer';
import CategorySlider from '../../components/category/CategorySlider';
import Hotgamescard from '../../components/gamespart/Hotgamescard';

const Hotgames = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [activeLeftTab, setActiveLeftTab] = useState('আমার অ্যাকাউন্ট');
  return (
    <section className="min-h-screen font-anek bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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
        <div className="hidden md:block  ">
          <Sidebar 
            showPopup={showPopup}
            setShowPopup={setShowPopup}
            activeLeftTab={activeLeftTab}
            setActiveLeftTab={setActiveLeftTab}
          />
        </div>

        {/* Scrollable Content */}
        <div className="ml-0 md:ml-[330px] w-full pt-2 md:pt-6">
          {/* Main content container */}
          <div className="mx-auto md:px-4">
           <Hotgamescard/>
            
         
          </div>
          
          {/* Dark themed footer */}
          <Footer className="mt-12 bg-gray-900/90 border-t border-gray-700" />
        </div>
      </div>
    </section>
  );
};

export default Hotgames;