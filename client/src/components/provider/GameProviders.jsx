import React, { useState, useEffect, useContext } from 'react';
import Header from '../header/Header';
import Sidebar from '../sidebar/Sidebar';
import { GlobeAltIcon } from '@heroicons/react/24/solid';
import { LanguageContext } from '../../context/LanguageContext';

const GameProviders = () => {
  const { t, changeLanguage, language } = useContext(LanguageContext);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState(t.myAccount);

  const toggleLanguage = () => {
    changeLanguage(
      language.code === 'bn'
        ? { code: 'en', name: 'English', flag: 'https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/US.svg' }
        : { code: 'bn', name: 'বাংলা', flag: 'https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/BD.svg' }
    );
  };
  
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Fetch providers from API
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${base_url}/api/all-providers`);
        if (!response.ok) {
          throw new Error('Failed to fetch providers');
        }
        const data = await response.json();
        setProviders(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching providers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [base_url]);

  // Why Us Points using translation system
  const whyUsPoints = [
    t.providersLoadError, // Using existing translation key, you might want to add specific ones
    t.providersLoadError, // Using existing translation key, you might want to add specific ones
    t.providersLoadError, // Using existing translation key, you might want to add specific ones
    t.providersLoadError, // Using existing translation key, you might want to add specific ones
    t.providersLoadError, // Using existing translation key, you might want to add specific ones
  ];

  return (
    <section className="min-h-screen font-anek pb-[90px] md:pb-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800">
      {/* Header with light glass morphism effect */}
      <Header 
        className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm"
        showPopup={showPopup}
        setShowPopup={setShowPopup}
        activeLeftTab={activeLeftTab}
        setActiveLeftTab={setActiveLeftTab}
      />
      
      <div className="flex flex-col md:flex-row">
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowPopup(!showPopup)}
            className="p-3 rounded-full bg-blue-500 shadow-lg hover:bg-theme_color2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Sidebar */}
        {showPopup && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowPopup(false)}></div>
            <div className="absolute left-0 top-0 h-full w-3/4 max-w-xs bg-white shadow-xl z-50">
              <Sidebar 
                showPopup={showPopup}
                setShowPopup={setShowPopup}
                activeLeftTab={activeLeftTab}
                setActiveLeftTab={setActiveLeftTab}
              />
            </div>
          </div>
        )}

        {/* Fixed Sidebar for desktop */}
        <div className="hidden md:block fixed h-full">
          <Sidebar 
            showPopup={showPopup}
            setShowPopup={setShowPopup}
            activeLeftTab={activeLeftTab}
            setActiveLeftTab={setActiveLeftTab}
          />
        </div>

        {/* Scrollable Content */}
        <div className="ml-0 md:ml-[330px] flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 md:p-8 lg:p-12 mb-8 sm:mb-12 border border-gray-200 shadow-sm">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-800">{t.gameProviders}</h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl">
                {language.code === 'bn' 
                  ? "Genzz.casino-এ আমাদের প্রিমিয়াম গেম প্রদানকারীদের সাথে পরিচিত হন" 
                  : "Meet our premium game providers at Genzz.casino"
                }
              </p>
            </div>

            {/* Providers Section */}
            <div className="mb-10 sm:mb-14 md:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-theme_color2 to-purple-600">
                {language.code === 'bn' ? "আমাদের গেম প্রদানকারীরা" : "Our Game Providers"}
              </h2>
              
              {loading ? (
               <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent"></div>
            <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-blue-500/10 blur-sm"></div>
          </div>
        </div>
              ) : error ? (
                <div className="bg-red-50 rounded-xl p-6 text-center border border-red-200 max-w-2xl mx-auto">
                  <p className="text-red-600 mb-4">{t.providersLoadError}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    {t.tryAgain}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                  {providers.map((provider) => (
                    <div key={provider._id} className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-all hover:shadow-lg hover:scale-105 duration-300 group">
                      <div className="p-3 flex flex-col items-center h-full">
                        <div className="w-full h-20 mb-3 flex items-center justify-center bg-gray-50 rounded-md p-1 group-hover:bg-gray-100 transition-colors">
                          <img 
                            src={`${base_url}/images/${provider.imageUrl}`} 
                            alt={provider.providerName} 
                            className="max-h-16 max-w-full object-contain"
                          />
                        </div>
                        <h3 className="text-sm font-medium mb-2 text-center text-gray-700 line-clamp-2">{provider.providerName}</h3>
                        <div className="mt-auto pt-2 w-full">
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded px-2 py-1 text-center">
                            <span className="text-theme_color2 font-medium text-xs">
                              {language.code === 'bn' ? 'গেম প্রদানকারী' : 'Game Provider'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Why Us Section */}
            <div className="mb-10 sm:mb-14 md:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-gray-800">
                {language.code === 'bn' ? "কেন আমাদের গেম প্রদানকারীদের বেছে নেবেন?" : "Why Choose Our Game Providers?"}
              </h2>
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-sm mx-auto">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    language.code === 'bn' ? "নিয়মিতভাবে নতুন গেম যোগ করা হয়" : "New games added regularly",
                    language.code === 'bn' ? "সব গেম ন্যায্যতা এবং নিরাপত্তার জন্য পরীক্ষিত" : "All games tested for fairness and security",
                    language.code === 'bn' ? "মোবাইল এবং ডেস্কটপ উভয়ের জন্য অপ্টিমাইজড" : "Optimized for both mobile and desktop",
                    language.code === 'bn' ? "বিভিন্ন বাজেটের জন্য গেম" : "Games for all budgets",
                    language.code === 'bn' ? "উচ্চ RTP (রিটার্ন টু প্লেয়ার) হার" : "High RTP (Return To Player) rates"
                  ].map((point, index) => (
                    <li key={index} className="flex items-start text-sm sm:text-base p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <span className="text-blue-500 mr-3 mt-0.5 text-lg">✓</span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 sm:p-8 md:p-10 lg:p-12 border border-gray-200 shadow-sm">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-center text-gray-800">
                {language.code === 'bn' ? "আজই খেলুন এবং জিতুন!" : "Play and Win Today!"}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 text-center max-w-3xl mx-auto">
                {language.code === 'bn' 
                  ? "আমাদের গেম প্রদানকারীদের বিশাল সংগ্রহ থেকে আপনার পছন্দের গেম খুঁজে নিন।" 
                  : "Find your favorite game from our providers' vast collection."
                }
              </p>
              <div className="text-center">
                <button className="px-6 py-2 sm:px-8 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold text-base sm:text-lg hover:from-theme_color2 hover:to-purple-600 transition-all transform hover:scale-105 shadow-md">
                  {t.allGames}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameProviders;