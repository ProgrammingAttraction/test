import React, { useState, useEffect } from 'react';
import Header from '../../components/header/Header';
import Sidebar from '../../components/sidebar/Sidebar';
import BannerSlider from '../../components/banner/BannerSlider';
import Footer from '../../components/footer/Footer';
import CategorySlider from '../../components/category/CategorySlider';
import axios from "axios";

const Home = () => {
  // State for controlling sidebar popup and active tab
  const [showPopup, setShowPopup] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState('আমার অ্যাকাউন্ট');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');
    
  useEffect(() => {
    // Scroll to top on initial load
    window.scrollTo(0, 0);
    
    // Fetch games data when component mounts
    fetchGamesData();
  }, []);

  // Function to download text file
  const downloadTextFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to fetch games data
  const fetchGamesData = async () => {
    setIsLoading(true);
    setDownloadStatus('Fetching games data...');
    
    try {
      const response = await axios.get('https://admin2.genzz.casino/api/games/games'); // Adjust the endpoint as needed
      
      if (response.data.success) {
        const gamesData = response.data.data;
        
        // Convert games data to formatted text
        const formattedData = formatGamesData(gamesData);
        
        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `games-data-${timestamp}.txt`;
        
        // Download the file
        downloadTextFile(formattedData, filename);
        
        setDownloadStatus(`✅ Successfully downloaded ${gamesData.length} games to ${filename}`);
      } else {
        throw new Error(response.data.message || 'Failed to fetch games data');
      }
    } catch (error) {
      console.error('Error fetching games data:', error);
      setDownloadStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to format games data as text
  const formatGamesData = (games) => {
    let formattedText = `GAMES DATA EXPORT\n`;
    formattedText += `Generated on: ${new Date().toLocaleString()}\n`;
    formattedText += `Total games: ${games.length}\n`;
    formattedText += `========================================\n\n`;
    
    games.forEach((game, index) => {
      formattedText += `Game #${index + 1}\n`;
      formattedText += `-----------\n`;
      
      // Format each game's properties
      Object.keys(game).forEach(key => {
        const value = game[key];
        if (value !== null && value !== undefined) {
          if (typeof value === 'object') {
            formattedText += `${key}: ${JSON.stringify(value, null, 2)}\n`;
          } else {
            formattedText += `${key}: ${value}\n`;
          }
        }
      });
      
      formattedText += `\n========================================\n\n`;
    });
    
    return formattedText;
  };

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
        <div className="hidden md:block">
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
            {/* Download Status Indicator */}
            <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Games Data Export</h3>
                  <p className={`text-sm ${isLoading ? 'text-yellow-400' : downloadStatus.includes('✅') ? 'text-green-400' : downloadStatus.includes('❌') ? 'text-red-400' : 'text-gray-300'}`}>
                    {downloadStatus || 'Ready to fetch games data...'}
                  </p>
                </div>
                {isLoading && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                )}
              </div>
              
              {/* Manual Download Button */}
              <button 
                onClick={fetchGamesData}
                disabled={isLoading}
                className="mt-2 px-4 py-2 bg-theme_color2 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md transition-colors"
              >
                {isLoading ? 'Downloading...' : 'Download Games Data Again'}
              </button>
            </div>
            
            {/* Banner with dark theme styling */}
            <div className="rounded-xl overflow-hidden mb-8">
              <BannerSlider />
            </div>
            
            {/* Mobile Sidebar Popup (shown when showPopup is true) */}
            {showPopup && (
              <div className="fixed inset-0 z-[10000] md:hidden">
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