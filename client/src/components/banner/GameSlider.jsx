import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const GameCard = ({ image, title }) => (
  <div className="flex-none group cursor-pointer transition-transform duration-200 hover:scale-105 select-none mr-[30px]">
    <div className="relative aspect-square overflow-hidden rounded-xl shadow-lg border border-gray-200 bg-gray-300">
      <img 
        src={image} 
        alt={title} 
        // pointer-events-none prevents the image from being "dragged" by the browser
        className="w-full h-full object-cover transition-opacity group-hover:opacity-80 pointer-events-none"
      />
    </div>
    <p className="mt-1 text-center text-[13px] md:text-sm font-medium text-gray-800 truncate px-1">
      {title}
    </p>
  </div>
);

const GameSlider = () => {
  const scrollRef = useRef(null);
  
  // State for dragging logic
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const games = [
    { id: 1, title: 'Crazy Time', image: 'https://xxxbetgames.com/image/vertical_2/42169.webp' },
    { id: 2, title: 'Aviator', image: 'https://xxxbetgames.com/image/vertical_2/30215.webp' },
    { id: 3, title: 'Super Ace', image: 'https://xxxbetgames.com/image/vertical_2/30200.webp' },
    { id: 4, title: 'Sweet Candy', image: 'https://xxxbetgames.com/image/vertical_2/10790.webp' },
    { id: 5, title: 'Mega Ball', image: 'https://xxxbetgames.com/image/vertical_2/42169.webp' },
    { id: 6, title: 'Plinko', image: 'https://xxxbetgames.com/image/vertical_2/30215.webp' },
    { id: 7, title: 'Gate of Olympus', image: 'https://xxxbetgames.com/image/vertical_2/30200.webp' },
    { id: 8, title: 'Sugar Rush', image: 'https://xxxbetgames.com/image/vertical_2/10790.webp' },
        { id: 9, title: 'Gate of Olympus', image: 'https://xxxbetgames.com/image/vertical_2/30200.webp' },
    { id: 10, title: 'Sugar Rush', image: 'https://xxxbetgames.com/image/vertical_2/10790.webp' },
        { id: 11, title: 'Gate of Olympus', image: 'https://xxxbetgames.com/image/vertical_2/30200.webp' },
    { id: 12, title: 'Sugar Rush', image: 'https://xxxbetgames.com/image/vertical_2/10790.webp' },
  ];

  // --- Dragging Handlers ---
  const handleMouseDown = (e) => {
    setIsDragging(true);
    // Get starting X position and current scroll position
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiplier '2' determines scroll speed
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // --- Button Navigation ---
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-4 relative group max-w-full overflow-hidden">
      {/* Navigation Buttons */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Scroll Container */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex gap-3 overflow-x-auto scrollbar-hide pb-2 cursor-grab active:cursor-grabbing ${
          isDragging ? 'scroll-auto' : 'scroll-smooth snap-x snap-mandatory'
        }`}
        style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch' 
        }}
      >
        {games.map((game) => (
          <div key={game.id} className="snap-start flex-none w-[calc(25%-9px)] md:w-40">
            <GameCard title={game.title} image={game.image} />
          </div>
        ))}
      </div>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default GameSlider;