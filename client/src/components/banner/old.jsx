import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight, FaBell, FaGift } from 'react-icons/fa';
import { FaLock } from "react-icons/fa";
import Mainpagegame from '../games/Mainpagegame';
import CategorySlider from '../category/CategorySlider';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import NoticeMarquee from './NoticeMarquee';
import { FaWallet, FaMoneyBill } from 'react-icons/fa';
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import banner1 from "../../assets/banner1.png";
import banner2 from "../../assets/banner2.png";
import banner3 from "../../assets/banner3.png";
const BannerSlider = () => {
  const [current, setCurrent] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  // Fetch banner data from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(`${base_url}/api/all-sliders`);
        if (response.data) {
          setBanners(response.data.data[0].filenames || []);
        } else {
          setError("Failed to fetch banners");
        }
      } catch (err) {
        console.error("Error fetching banners:", err);
        setError("Error loading banners. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        nextSlide();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  if (loading) {
    return (
      <section className="w-full flex justify-center items-center sm:px-4 px-2">
        <section className='w-full md:w-[80%]'>
          <div className="flex w-full rounded-xl h-[150px] sm:h-[250px] md:h-[400px] bg-gray-200 animate-pulse"></div>
        </section>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full flex justify-center items-center sm:px-4 px-2">
        <section className='w-full md:w-[80%]'>
          <div className="flex w-full rounded-xl h-[150px] sm:h-[250px] md:h-[400px] bg-gray-200 items-center justify-center text-red-500">
            {error}
          </div>
        </section>
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="w-full flex justify-center items-center sm:px-4 px-2">
        <section className='w-full md:w-[80%]'>
          <div className="flex w-full rounded-xl h-[150px] sm:h-[250px] md:h-[400px] bg-gray-200 items-center justify-center">
             Not available
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="w-full flex justify-center items-center sm:px-4 px-2">
      <section className='w-full md:w-[95%]'>
        {/* Banner Slider */}
        <div className="flex w-full md:rounded-xl h-[180px] sm:h-[250px] md:h-[400px] overflow-hidden relative group">
          {banners.map((img, index) => (
            <img
              key={index}
              src={`${base_url}/images/${img}`} // Adjust this path according to your server setup
              alt={`slide-${index}`}
              className={`transition-all duration-500 w-full rounded-[5px] md:rounded-xl ${index === current ? 'block' : 'hidden'}`}
            />
          ))}
          {/* ----------hrllo */}
          {/* Left Arrow - Smaller on mobile */}
          <button
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white bg-black/90 cursor-pointer hover:bg-black/70 p-2 sm:p-3 rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
            onClick={prevSlide}
          >
            <IoIosArrowBack className="text-sm sm:text-lg" />
          </button>
          
          {/* Right Arrow - Smaller on mobile */}
          <button
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white cursor-pointer bg-black/90 hover:bg-black/70 p-2 sm:p-3 rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
            onClick={nextSlide}
          >
            <IoIosArrowForward className="text-sm sm:text-lg" />
          </button>
          
          {/* Dots - Smaller on mobile */}
          <div className="absolute bottom-2 sm:bottom-4 w-full flex justify-center gap-1 sm:gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`h-1 sm:h-2 w-4 sm:w-8 cursor-pointer rounded-full transition-all duration-300 ${current === index ? 'bg-white' : 'bg-white/30 hover:bg-white/50'}`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>

        {/* Bottom Notification - Improved for mobile */}
       <NoticeMarquee/>
        
        {/* Action Buttons - 3D Style */}
        {
          user ? <div className="flex justify-center gap-4 sm:gap-6 mt-3 md:hidden">
  {/* Deposit Button */}
  <NavLink 
    to="/deposit" 
    className="relative px-4 sm:px-6 py-3 sm:py-3 w-[50%] cursor-pointer text-[15px] font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 
    bg-gradient-to-br from-emerald-500/10 via-gray-900 to-purple-500/10
    border border-emerald-400/20 hover:border-emerald-400/40
    hover:bg-gradient-to-br hover:from-emerald-500/15 hover:via-gray-900 hover:to-purple-500/15
    "
  >
    <span className="text-emerald-300 text-[14px] tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
      ডিপোজিট
    </span>
    <span className="absolute right-3 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.5)]"></span>
  </NavLink>

  {/* Withdraw Button */}
  <NavLink 
    to="/withdraw" 
    className="relative px-4 sm:px-6 py-3 sm:py-3 w-[50%] cursor-pointer text-[15px] font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 
    bg-gradient-to-br from-blue-500/10 via-gray-900 to-cyan-500/10
    border border-blue-400/20 hover:border-blue-400/40
    hover:bg-gradient-to-br hover:from-blue-500/15 hover:via-gray-900 hover:to-cyan-500/15
  "
  >
    <span className="text-blue-300 text-[14px] tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
      উইথড্র
    </span>
    <span className="absolute right-3 h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_6px_2px_rgba(96,165,250,0.5)]"></span>
  </NavLink>
</div>:""
        }

        
        {/* <CategorySlider/> */}
        <Mainpagegame/>
      </section>
    </section>
  );
};

export default BannerSlider;