import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { FaFire, FaBaby, FaCalendarAlt, FaFutbol, FaLeaf, FaDragon, FaBowlingBall, FaGamepad, FaDice } from 'react-icons/fa';
import { useCallback, useEffect, useState } from 'react';

const categories = [
  { icon: <FaFire className="text-orange-400" />, label: 'গরম খেলা' },
  { icon: <FaBaby className="text-pink-400" />, label: 'প্রিয়' },
  { icon: <FaCalendarAlt className="text-blue-400" />, label: 'স্লট' },
  { icon: <FaFutbol className="text-green-400" />, label: 'লাইভ' },
  { icon: <FaLeaf className="text-emerald-400" />, label: 'পোকার' },
  { icon: <FaDragon className="text-purple-400" />, label: 'ফিশিং' },
  { icon: <FaBowlingBall className="text-red-400" />, label: 'স্পোর্টস' },
  { icon: <FaGamepad className="text-indigo-400" />, label: 'ই-স্পোর্টস' },
  { icon: <FaDice className="text-yellow-400" />, label: 'লটারি' },
  { icon: <FaFire className="text-orange-400" />, label: 'গরম খেলা' },
  { icon: <FaFutbol className="text-green-400" />, label: 'লাইভ' },
];

const CategoryItem = ({ item, index, selectedIndex, onClick, isMobile = false }) => (
  <div className={`relative flex-shrink-0 ${isMobile ? 'w-20' : 'w-24'}`}>
    <div 
      className={`group relative flex flex-col items-center justify-center ${
        isMobile ? 'w-20 h-20' : 'w-24 h-24'
      } cursor-pointer transition-all duration-300 active:scale-95`}
      onClick={() => onClick(index)}
    >
      {/* Background with glow effect when selected */}
      <div
        className={`absolute inset-0 rounded-xl transition-all duration-300 ${
          selectedIndex === index
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg border border-cyan-400/30 shadow-cyan-400/20'
            : 'bg-gray-800 border border-gray-700 hover:border-cyan-400/30 hover:shadow-md hover:shadow-cyan-400/10'
        }`}
      >
        {!isMobile && selectedIndex === index && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-cyan-400/10 to-transparent opacity-60"></div>
        )}
      </div>

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center h-full w-full p-2 transform transition-all duration-300 ${
          selectedIndex === index 
            ? (isMobile ? 'scale-105' : 'scale-110') 
            : 'group-hover:scale-105'
        }`}
      >
        <div
          className={`${isMobile ? 'text-xl' : 'text-2xl'} mb-1 transition-colors duration-300 ${
            selectedIndex === index 
              ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(10,200,200,0.6)]' 
              : 'text-gray-300 group-hover:text-cyan-300'
          }`}
        >
          {item.icon}
        </div>
        <span
          className={`text-xs text-center font-medium transition-colors duration-300 ${
            selectedIndex === index 
              ? 'text-cyan-400 font-semibold' 
              : 'text-gray-300 group-hover:text-white'
          }`}
        >
          {item.label}
        </span>
      </div>

      {/* Active indicator */}
      {selectedIndex === index && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-1 bg-cyan-400 rounded-full"></div>
      )}
    </div>
  </div>
);

const CategorySlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    loop: false,
  });
const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="w-full pt-2 md:pt-4 relative">
      {/* Desktop Grid View - hidden on mobile */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-11 gap-4 ">
          {categories.map((item, index) => (
            <CategoryItem 
              key={index} 
              item={item} 
              index={index} 
              selectedIndex={selectedIndex} 
              onClick={setSelectedIndex}
            />
          ))}
        </div>
      </div>

      {/* Mobile Carousel View - shown only on mobile */}
      <div className="md:hidden px-2">
        {/* Carousel container */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y gap-3">
            {categories.map((item, index) => (
              <CategoryItem 
                key={index} 
                item={item} 
                index={index} 
                selectedIndex={selectedIndex} 
                onClick={scrollTo}
                isMobile={true}
              />
            ))}
          </div>
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center mt-4 gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === selectedIndex 
                  ? 'bg-cyan-400 w-4 shadow-[0_0_6px_rgba(10,200,200,0.7)]' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySlider;