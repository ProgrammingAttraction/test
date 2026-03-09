import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaCrown,
  FaWallet,
  FaUserAlt,
  FaTrophy,
  FaHistory,
  FaChartLine,
  FaUserFriends,
  FaDownload,
  FaHeadset,
  FaChevronLeft,
} from 'react-icons/fa';
import {
  AiOutlineMessage,
  AiOutlineMail,
} from 'react-icons/ai';
import {
  MdOutlineSecurity,
  MdOutlineAccountCircle,
  MdOutlineMonetizationOn,
} from 'react-icons/md';
import { BsCurrencyDollar } from 'react-icons/bs';

const Account = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen p-4 font-sans">
      {/* Enhanced Header with Back Button */}
      <header className="sticky top-0 z-10 bg-white shadow-md rounded-lg mb-6 p-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaChevronLeft className="text-gray-600 text-xl" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex-grow">My Account</h1>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-md transition-colors">
            Sign In
          </button>
        </div>
      </header>

      {/* User Profile Section with 3D Effect */}
      <div className="bg-white rounded-xl shadow-lg mb-6 p-5 transform transition-all hover:shadow-xl">
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-theme_color2 text-white rounded-full w-14 h-14 flex items-center justify-center mr-4 shadow-md">
            <span className="font-bold text-xl">V</span>
          </div>
          <div>
            <div className="flex items-center">
              <span className="font-bold text-gray-800 mr-2">VIP0</span>
              <FaCrown className="text-yellow-500 text-lg" />
            </div>
            <div className="text-gray-700 font-medium">16758487267</div>
            <div className="text-sm text-gray-500">Nickname: 16758487267</div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h2 className="font-bold text-lg mb-3 text-gray-800">Deposit</h2>
          <div className="flex space-x-3">
            <button className="bg-gradient-to-r from-blue-500 to-theme_color2 hover:from-theme_color2 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex-1 shadow-md transition-all transform hover:-translate-y-0.5">
              Deposit
            </button>
            <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex-1 shadow-md transition-all transform hover:-translate-y-0.5">
              Withdrawal
            </button>
            <button className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex-1 shadow-md transition-all transform hover:-translate-y-0.5">
              My Cards
            </button>
          </div>
        </div>
      </div>
      
      {/* Member Center Section with Enhanced 3D Cards */}
      <div className="bg-white rounded-xl shadow-lg p-5 mb-6">
        <h2 className="font-bold text-lg mb-4 text-gray-800">Member Center</h2>
        <div className="grid grid-cols-4 gap-3 text-center">
          {/* Row 1 */}
          <Link to="/reward" className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
            <FaTrophy className="mx-auto text-2xl text-blue-500 mb-2" />
            <span className="text-xs font-medium text-gray-700">Reward Center</span>
          </Link>
          <Link to="/betting-record" className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
            <FaHistory className="mx-auto text-2xl text-blue-500 mb-2" />
            <span className="text-xs font-medium text-gray-700">Betting Record</span>
          </Link>
          <Link to="/profit-loss" className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
            <FaChartLine className="mx-auto text-2xl text-blue-500 mb-2" />
            <span className="text-xs font-medium text-gray-700">Profit And Loss</span>
          </Link>
          <Link to="/deposit-record" className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
            <BsCurrencyDollar className="mx-auto text-2xl text-blue-500 mb-2" />
            <span className="text-xs font-medium text-gray-700">Deposit Record</span>
          </Link>
          
          {/* Row 2 */}
          <Link to="/withdrawal-record" className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
            <FaWallet className="mx-auto text-2xl text-blue-500 mb-2" />
            <span className="text-xs font-medium text-gray-700">Withdrawal Record</span>
          </Link>
          <Link to="/account-record" className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
            <MdOutlineAccountCircle className="mx-auto text-2xl text-blue-500 mb-2" />
            <span className="text-xs font-medium text-gray-700">Account Record</span>
          </Link>
          <Link to="/my-account" className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
            <FaUserAlt className="mx-auto text-2xl text-blue-500 mb-2" />
            <span className="text-xs font-medium text-gray-700">My Account</span>
          </Link>
          <Link to="/security" className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
            <MdOutlineSecurity className="mx-auto text-2xl text-blue-500 mb-2" />
            <span className="text-xs font-medium text-gray-700">Security Center</span>
          </Link>
          
          {/* Row 3 */}
          <Link to="/invite" className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
            <FaUserFriends className="mx-auto text-2xl text-blue-500 mb-2" />
            <span className="text-xs font-medium text-gray-700">Invite Friends</span>
          </Link>
          <Link to="/rebate" className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
            <MdOutlineMonetizationOn className="mx-auto text-2xl text-blue-500 mb-2" />
            <span className="text-xs font-medium text-gray-700">Manual Rebate</span>
          </Link>
          <Link to="/messages" className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all relative">
            <AiOutlineMail className="mx-auto text-2xl text-blue-500 mb-2" />
            <span className="text-xs font-medium text-gray-700">Internal Message</span>
            <span className="absolute top-2 right-3 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">1</span>
          </Link>
          <Link to="/suggestion" className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
            <AiOutlineMessage className="mx-auto text-2xl text-blue-500 mb-2" />
            <span className="text-xs font-medium text-gray-700">Suggestion</span>
          </Link>
        </div>
      </div>
      
      {/* Bottom Options with Enhanced Design */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/download" className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-center hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100">
          <FaDownload className="text-blue-500 text-xl mr-3" />
          <span className="font-medium text-gray-700">Download APP</span>
        </Link>
        <Link to="/customer-service" className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-center hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100">
          <FaHeadset className="text-blue-500 text-xl mr-3" />
          <span className="font-medium text-gray-700">Customer Service</span>
        </Link>
      </div>
    </div>
  );
};

export default Account;