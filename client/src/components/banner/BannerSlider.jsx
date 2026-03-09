import React, { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Mainpagegame from '../games/Mainpagegame';
import NoticeMarquee from './NoticeMarquee';
import banner1 from "../../assets/banner/banner5.jpg";
import banner2 from "../../assets/banner/banner6.jpg";
import banner3 from "../../assets/banner/banner7.jpg";

import { LanguageContext } from '../../context/LanguageContext';
import GameSlider from './GameSlider';

const BannerSlider = () => {
  const [current, setCurrent] = useState(0);
  const { t } = useContext(LanguageContext); // Get translations from LanguageContext

  // Banner data with translated text content
  const banners = [
    {
      image: banner1,
      title: t.banner1_title,
      subtitle: t.banner1_subtitle,
      description: t.banner1_description,
      textColor: "text-white",
      glowColor: "glow-emerald"
    },
    {
      image: banner2,
      title: t.banner2_title,
      subtitle: t.banner2_subtitle,
      description: t.banner2_description,
      textColor: "text-white",
      glowColor: "glow-blue"
    },
    {
      image: banner3,
      title: t.banner3_title,
      subtitle: t.banner3_subtitle,
      description: t.banner3_description,
      textColor: "text-white",
      glowColor: "glow-gold"
    },
  ];

  const user = JSON.parse(localStorage.getItem('user'));

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  // Go to specific slide
  const goToSlide = (index) => {
    setCurrent(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 6000); // 6 seconds interval
    return () => clearInterval(interval);
  }, [current]);

  return (
    <section className="w-full flex justify-center items-center sm:px-4 px-2">
      <section className='w-full xl:w-[95%]'>
        {/* Banner Slider */}
        <div className="flex w-full md:rounded-xl h-[180px] sm:h-[250px] md:h-[400px] overflow-hidden relative group">
          {/* Navigation Arrows */}
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === current 
                  ? 'opacity-100 z-5' 
                  : 'opacity-0 z-0'
              }`}
            >
              <img
                src={banner.image}
                alt={`slide-${index}`}
                className="w-full h-full rounded-[5px] md:rounded-xl"
              />
              
              {/* Text Content with Glitter Effect */}
              <div className={`absolute left-3 sm:left-6 md:left-10 top-1/2 transform -translate-y-1/2 w-full max-w-[60%] sm:max-w-[55%] md:max-w-[50%]`}>
                <div className="space-y-1 sm:space-y-2 md:space-y-3">
                  <h2 className={`${banner.textColor} font-bold text-lg sm:text-2xl md:text-4xl lg:text-5xl leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${banner.glowColor}`}>
                    {banner.title}
                  </h2>
                  <h3 className={`${banner.textColor} font-extrabold text-xl sm:text-3xl md:text-5xl lg:text-6xl leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] ${banner.glowColor} animate-pulse`}>
                    {banner.subtitle}
                  </h3>
                  <p className={`${banner.textColor} text-xs sm:text-sm md:text-base lg:text-lg font-medium mt-1 sm:mt-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]`}>
                    {banner.description}
                  </p>
                </div>
              </div>

              {/* Glitter Particles Effect */}
              <div className="absolute inset-0 overflow-hidden rounded-[5px] md:rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                <div className="absolute top-0 left-0 w-20 h-20 bg-yellow-300/20 rounded-full blur-xl animate-bounce-slow"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-cyan-300/20 rounded-full blur-lg animate-pulse-slow"></div>
              </div>
            </div>
          ))}
          
          {/* Dots Indicator */}
          <div className="absolute bottom-2 sm:bottom-4 w-full flex justify-center gap-1 sm:gap-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 sm:h-2 w-6 sm:w-8 cursor-pointer rounded-full transition-all duration-300 ${
                  current === index 
                    ? 'bg-teal-400 scale-110 shadow-lg shadow-teal-400/50' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>

        {/* Bottom Notification */}
        <NoticeMarquee/>
         <GameSlider/>
        {/* Games Section */}
        <Mainpagegame/>
      </section>
     
      {/* Add custom styles for glitter effects */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        
        .animate-shimmer {
          animation: shimmer 4s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        /* Smooth transition for all elements */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </section>
  );
};

export default BannerSlider;