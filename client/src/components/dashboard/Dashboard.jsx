import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaWallet,
  FaSignOutAlt,
  FaGift,
  FaBullhorn,
  FaRegCreditCard,
  FaHistory,
  FaChartBar,
  FaGem,
  FaUserFriends,
  FaChevronRight,
  FaRedoAlt,
  FaFacebookF,
  FaTwitter,
  FaTelegramPlane,
  FaWhatsapp,
  FaCopy,
  FaMedal,
  FaTimes
} from "react-icons/fa";
import Sidebar from './Sidebar'; // Import the Sidebar component

const Dashboard = () => {
  const [showInvitePopup, setShowInvitePopup] = useState(false);

  const handleInviteClick = () => {
    setShowInvitePopup(true);
  };

  const handleClosePopup = () => {
    setShowInvitePopup(false);
  };

  const InvitePopup = () => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText("http://www.ck444app.net/");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm">
        <div className="w-full max-w-3xl bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-theme_color2 p-4 relative">
            <h2 className="text-xl font-bold text-white text-center">বন্ধুকে আমন্ত্রণ করুন</h2>
            <button 
              onClick={handleClosePopup}
              className="absolute top-3 right-4 text-white hover:text-gray-200 text-2xl font-bold"
            >
              <FaTimes />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Trophy Section */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white text-center shadow-lg">
              <div className="flex flex-col items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-4 mb-3">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/3132/3132693.png" 
                    alt="Trophy" 
                    className="w-16 h-16 object-contain" 
                  />
                </div>
                <h3 className="text-2xl font-bold mb-2">অয়ের লক্ষ্য</h3>
                <p className="text-sm opacity-90">বন্ধুদের আমন্ত্রণ করুন এবং বড় পুরস্কার জিতুন!</p>
              </div>
            </div>

            {/* Top Winners */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: '01*****3', amount: '৳ 10,714,542', place: '1st' },
                { id: '01*****1', amount: '৳ 8,638,021', place: '2nd' },
                { id: '01*****8', amount: '৳ 5,063,641', place: '3rd' },
              ].map((winner, index) => (
                <div 
                  key={index}
                  className={`bg-gradient-to-br ${index === 0 ? 'from-yellow-500 to-yellow-400' : index === 1 ? 'from-gray-400 to-gray-300' : 'from-amber-700 to-amber-600'} rounded-lg p-4 text-center text-white shadow-md`}
                >
                  <div className="text-xs font-semibold mb-1">{winner.place} স্থান</div>
                  <div className="text-lg font-bold mb-1">{winner.id}</div>
                  <div className="text-xl font-extrabold">{winner.amount}</div>
                </div>
              ))}
            </div>

            {/* Recent Rewards */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center">
                <FaMedal className="mr-2 text-yellow-500" /> যারা পুরস্কার পেয়েছেন
              </h3>
              <div className="space-y-3">
                {[
                  { phone: '01********9', reward: '৳ 120.00', time: '2 মিনিট আগে' },
                  { phone: '01********9', reward: 'ফ্রি স্পিন', time: '15 মিনিট আগে' },
                  { phone: '01********1', reward: '৳ 240.00', time: '1 ঘন্টা আগে' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-3 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{item.phone}</div>
                      <div className="text-xs text-gray-500">{item.time}</div>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {item.reward}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'আমন্ত্রণ পুরস্কার', amount: '৳ 54,499,176.00', claims: '123474 দাবি', gradient: 'from-blue-500 to-blue-400' },
                { title: 'সাপ্তাহিক পুরস্কার', amount: '৳ 1,433,680.00', claims: '21109 দাবি', gradient: 'from-purple-500 to-purple-400' },
                { title: 'ডাউনলোড রিওয়ার্ড', amount: '৳ 40,067,011.98', claims: '181341 দাবি', gradient: 'from-green-500 to-green-400' },
              ].map((stat, index) => (
                <div 
                  key={index}
                  className={`bg-gradient-to-r ${stat.gradient} rounded-xl p-4 text-white shadow-md`}
                >
                  <div className="font-bold text-sm mb-1">{stat.title}</div>
                  <div className="text-xl font-extrabold mb-1">{stat.amount}</div>
                  <div className="text-xs opacity-80">{stat.claims}</div>
                </div>
              ))}
            </div>

            {/* Invite Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
              <h3 className="text-lg font-bold text-center text-gray-800 mb-4">
                বন্ধুকে রেফার করুন এবং <span className="text-purple-600">১০০০ টাকা</span> উপার্জন করুন
              </h3>
              
              {/* Social Share */}
              <div className="flex justify-center gap-4 mb-6">
                {[
                  { icon: <FaFacebookF />, color: 'bg-theme_color2 hover:bg-blue-700', name: 'Facebook' },
                  { icon: <FaTwitter />, color: 'bg-blue-400 hover:bg-blue-500', name: 'Twitter' },
                  { icon: <FaTelegramPlane />, color: 'bg-blue-500 hover:bg-theme_color2', name: 'Telegram' },
                  { icon: <FaWhatsapp />, color: 'bg-green-500 hover:bg-green-600', name: 'WhatsApp' },
                ].map((social, index) => (
                  <button
                    key={index}
                    className={`${social.color} text-white p-3 rounded-full shadow-md transition-all transform hover:scale-110`}
                    title={`Share on ${social.name}`}
                  >
                    {social.icon}
                  </button>
                ))}
              </div>
              
              {/* Referral Link */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">আপনার রেফারেল লিংক</label>
                <div className="flex">
                  <input
                    type="text"
                    value="http://www.ck444app.net/"
                    readOnly
                    className="flex-1 px-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button 
                    onClick={handleCopy}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-r-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <FaCopy /> {copied ? 'কপি হয়েছে!' : 'কপি করুন'}
                  </button>
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-600 mt-4">
                প্রতিটি সফল রেফারেলের জন্য আপনি ১০% কমিশন পাবেন
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex bg-[#0a1d1d] min-h-screen font-sans text-white">
      {/* Sidebar */}
      <Sidebar onInviteClick={handleInviteClick} />

      {/* Main Panel */}
      <main className="flex-1 flex p-6 gap-4 bg-gray-100">
        {/* Profile Card */}
        <div className="w-[300px] bg-white rounded-lg shadow p-4 text-black">
          <div className="flex flex-col items-center">
            <img
              src="https://images.5943920202.com/TCG_PROD_IMAGES/B2C/01_PROFILE/PROFILE/0.png"
              alt="Profile"
              className="w-20 h-20 rounded-full border"
            />
            <div className="mt-2 text-center">
              <div className="flex justify-center items-center gap-1 text-gray-800 text-sm">
                <span className="font-semibold">t4590050297</span>
                <span className="text-xs bg-yellow-400 text-black px-1 rounded">VIP 0</span>
                <FaRedoAlt className="text-gray-500 text-xs" />
              </div>
              <p className="text-xl font-bold mt-2">৳ 0.00</p>
              <p className="text-xs text-gray-500 mt-1">রেজিস্টার হয়েছে 2025-07-27</p>
            </div>
          </div>
          <div className="mt-4 border-t pt-4 space-y-2 text-sm">
            <div className="flex items-center text-theme_color2">
              <FaChevronRight className="mr-1 text-xs" /> 0 জমা দেওয়ার অনুরোধ প্রক্রিয়াধীন
            </div>
            <div className="flex items-center text-orange-500">
              <FaChevronRight className="mr-1 text-xs" /> 0 উত্তোলন অনুরোধ প্রক্রিয়াধীন
            </div>
          </div>
        </div>

        {/* Security Panel */}
        <div className="flex-1 bg-white rounded-lg shadow text-black">
          <div className="bg-[#e84141] rounded-t-lg text-white p-6 text-center">
            <div className="text-4xl font-bold mb-2">নিম</div>
            <div className="text-sm mb-1">নিরাপত্তা শতকরা</div>
            <p className="text-xs">ফ্লেয়ার হল 16 শতাংশ। আপনার অ্যাকাউন্ট নিরাপত্তা স্তর হল নিম।</p>
          </div>
          <div className="grid grid-cols-3 p-6 gap-4 text-center text-sm">
            <div className="flex flex-col items-center">
              <FaUser className="text-yellow-400 text-2xl mb-1" />ব্যক্তিগত তথ্য
            </div>
            <div className="flex flex-col items-center">
              <FaWallet className="text-pink-500 text-2xl mb-1" />ই-ওয়ালেট বাঁধুন
            </div>
            <div className="flex flex-col items-center">
              <FaLock className="text-gray-700 text-2xl mb-1" />লেনদেন পাসওয়ার্ড
            </div>
          </div>

          <div className="p-6 space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <FaUser className="text-yellow-500" /> আপনার অ্যাকাউন্টের নিরাপত্তা উন্নত করতে ব্যক্তিগত তথ্য পূরণ করুন।
            </div>
            <div className="flex items-center gap-2">
              <FaLock className="text-cyan-500" /> লগইন পাসওয়ার্ড <span className="ml-auto text-green-600">✔️</span>
            </div>
            <div className="flex items-center gap-2 text-red-600">
              <FaWallet /> ই-ওয়ালেট বাঁধুন
            </div>
            <div className="flex items-center gap-2 text-red-600">
              <FaLock /> লেনদেন পাসওয়ার্ড
            </div>
            <div className="flex items-center gap-2 text-red-600">
              <FaSignOutAlt /> নিরাপদে লগআউট করুন
            </div>
          </div>
        </div>
      </main>

      {/* Invite Friends Popup */}
      {showInvitePopup && <InvitePopup />}
    </div>
  );
};

export default Dashboard;