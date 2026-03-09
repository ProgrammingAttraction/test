import React from 'react';
import { FaFacebookF, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';
import { BsChatDots } from 'react-icons/bs';
import { IoMdArrowBack } from 'react-icons/io';
import { PiCopySimpleBold } from 'react-icons/pi';

const Invitefriends = () => {
  return (
    <section className="min-h-screen font-sans bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0f524c] text-white shadow">
        <button className="text-2xl">
          <IoMdArrowBack />
        </button>
        <h1 className="text-lg font-semibold">Invite Friends</h1>
        <div className="w-6" />
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-around text-sm border-b">
        <button className="py-2 px-4 text-[#0f524c] font-medium border-b-2 border-[#0f524c]">Overview</button>
        <button className="py-2 px-4 text-gray-500">Rewards</button>
        <button className="py-2 px-4 text-gray-500">Incomes</button>
        <button className="py-2 px-4 text-gray-500">Records</button>
      </div>

      {/* Overview Info */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="bg-gradient-to-r from-blue-400 to-theme_color2 text-white p-4 rounded-lg text-center">
          <p className="text-sm">Today's Income</p>
          <p className="text-lg font-bold">৳ 0.00</p>
        </div>
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-4 rounded-lg text-center">
          <p className="text-sm">Yesterday's Income</p>
          <p className="text-lg font-bold">৳ 0.00</p>
        </div>
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-4 rounded-lg text-center">
          <p className="text-sm">Registers</p>
          <p className="text-lg font-bold">0</p>
        </div>
        <div className="bg-gradient-to-r from-blue-400 to-theme_color2 text-white p-4 rounded-lg text-center">
          <p className="text-sm">Valid Referral</p>
          <p className="text-lg font-bold">0</p>
        </div>
      </div>

      {/* Share section */}
      <div className="p-4">
        <p className="text-center font-semibold text-gray-800 mb-2">Share to your friends</p>
        <div className="flex justify-center gap-4 mb-4">
          <FaFacebookF className="text-theme_color2 text-xl" />
          <BsChatDots className="text-green-500 text-xl" />
          <img src="https://cdn-icons-png.flaticon.com/512/3670/3670151.png" alt="x" className="w-5 h-5" />
          <FaTelegramPlane className="text-blue-400 text-xl" />
          <FaWhatsapp className="text-green-600 text-xl" />
        </div>
        <div className="bg-gray-100 flex items-center justify-between px-3 py-2 rounded">
          <p className="text-sm truncate">http://www.ck444app.net/?r=xii0723</p>
          <button className="text-theme_color2 text-xl">
            <PiCopySimpleBold />
          </button>
        </div>
      </div>

      {/* Bonus section */}
      <div className="p-4 text-center">
        <p className="font-bold text-base text-[#0f524c] mb-2">Invite 1 person and earn up to 1000TK</p>
        <p className="text-sm text-orange-600 font-semibold">Earn 2.2% on lower level deposits</p>
        <p className="text-sm text-orange-600 font-semibold">Lower level earns 1% on every bet</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto p-4">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">Inviter VIP level</th>
              <th className="border px-2 py-1">Referral bonus/per person</th>
              <th className="border px-2 py-1">Recommend a friend request</th>
              <th className="border px-2 py-1">How to get it?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">VIP0</td>
              <td className="border px-2 py-1">100TK</td>
              <td className="border px-2 py-1">Deposit 100TK & Bet 2000TK</td>
              <td className="border px-2 py-1">—</td>
            </tr>
            <tr>
              <td className="border px-2 py-1">VIP1-2</td>
              <td className="border px-2 py-1">150TK</td>
              <td className="border px-2 py-1">Deposit 100TK & Bet 2000TK</td>
              <td className="border px-2 py-1">—</td>
            </tr>
            {/* Add more rows as needed */}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Invitefriends;