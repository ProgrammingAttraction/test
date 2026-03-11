import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiGlobe, FiBell, FiKey, FiChevronDown, FiMenu, FiUser, FiSettings, FiActivity, FiLogOut } from 'react-icons/fi';
import { HiOutlineGlobeAlt, HiOutlineKey, HiOutlineSearch } from 'react-icons/hi';
import { IoMdNotificationsOutline } from 'react-icons/io';
import toast, { Toaster } from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const Header = ({ title, onMenuToggle }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef(null);

  const logoutfunction = () => {
    toast.success("Logout Successfully!");
    localStorage.removeItem("genzz_token");
    localStorage.removeItem("genzz_admin");
    navigate("/")
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className='bg-[#071251] font-bai sticky top-0 left-0 z-50 shadow-lg border-b border-blue-700 flex items-center justify-between px-6 py-3'>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }
        }}
      />
      
      {/* Mobile Menu Button and Title */}
      <div className='flex items-center'>
        <button 
          onClick={onMenuToggle}
          className='md:hidden text-white mr-4 p-1 rounded-md hover:bg-blue-700 transition-colors'
        >
          <FiMenu size={24} />
        </button>
        
        {/* Title for all screens */}
        <h1 className='text-white font-semibold text-xl tracking-tight'>{title}</h1>
      </div>

      {/* Icons and Admin */}
      <div className='flex items-center space-x-4'>
        {/* Search toggle button for mobile */}
        <button 
          className='md:hidden text-white p-2 rounded-md hover:bg-blue-700 transition-colors'
          onClick={() => setShowSearch(!showSearch)}
        >
          <HiOutlineSearch size={20} />
        </button>

        {/* Mobile Search Bar (appears when toggled) */}
        {showSearch && (
          <div className='md:hidden absolute top-full left-0 right-0 bg-blue-800 p-3 shadow-lg'>
            <div className='relative'>
              <HiOutlineSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
              <input 
                type='text'
                placeholder='Search...'
                className='w-full bg-blue-700 text-white placeholder-blue-200 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-600'
                autoFocus
              />
            </div>
          </div>
        )}


        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          {/* Profile Button */}
          <button
            className="flex items-center bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/20 transition-all border border-white/10"
            onClick={() => setIsOpen(!isOpen)}
          >
            <img
              src="https://isomorphic-furyroad.vercel.app/avatar.webp"
              alt="Profile"
              className="w-7 h-7 rounded-full border-2 border-white/30"
            />
            <span className="ml-2 font-medium hidden md:inline">admin</span>
            <FiChevronDown className={`ml-1 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border z-50 border-gray-200 rounded-xl shadow-xl overflow-hidden">
              <div className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50">
                <img
                  src="https://isomorphic-furyroad.vercel.app/avatar.webp"
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                />
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-800">Admin</p>
                  <p className="text-xs text-gray-600">admin@gmail.com</p>
                </div>
              </div>
              <hr className="border-gray-200" />
              <ul className="py-2">
                <li className="px-4 py-2.5 text-sm cursor-pointer flex items-center text-gray-700 hover:bg-blue-50 transition-colors">
                  <FiUser className="mr-3 text-gray-500" size={16} />
                  My Profile
                </li>
                <li className="px-4 py-2.5 text-sm cursor-pointer flex items-center text-gray-700 hover:bg-blue-50 transition-colors">
                  <FiSettings className="mr-3 text-gray-500" size={16} />
                  Account Settings
                </li>
                <li className="px-4 py-2.5 text-sm cursor-pointer flex items-center text-gray-700 hover:bg-blue-50 transition-colors">
                  <FiActivity className="mr-3 text-gray-500" size={16} />
                  Activity Log
                </li>
                <hr className="border-gray-200 my-1" />
                <li 
                  className="px-4 py-2.5 text-sm cursor-pointer flex items-center text-red-500 hover:bg-red-50 transition-colors"
                  onClick={logoutfunction}
                >
                  <FiLogOut className="mr-3" size={16} />
                  Sign Out
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;