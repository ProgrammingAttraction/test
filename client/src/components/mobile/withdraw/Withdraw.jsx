import React, { useState } from 'react';
import { FaPlus, FaEye } from 'react-icons/fa';
import { IoMdRefresh } from 'react-icons/io';
import { FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

const Withdraw = () => {
  const [method, setMethod] = useState('bkash');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const methods = [
    { id: 'bkash', label: 'bKash' },
    { id: 'nagad', label: 'Nagad' },
  ];
  const handleBack = () => {
    navigate(-1); // This will take the user back to the previous page
  };
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
  <div className="bg-theme_color2 text-white p-4 mb-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleBack}
            className="text-white text-lg font-bold"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-semibold">Withdrawal</h1>
        </div>
      </div>

    <div className='p-2'>
  {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-4 ">
        {methods.map((m) => (
          <div
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`px-4 py-2 text-sm font-semibold cursor-pointer ${
              method === m.id ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'
            }`}
          >
            {m.label} <span className="ml-1 text-xs text-gray-500">E wallet</span>
          </div>
        ))}
      </div>

      {/* Empty Wallet Section */}
      <div className="flex flex-col items-center justify-center text-gray-500 mt-10">
        <img
          src="https://cdn-icons-png.flaticon.com/512/929/929430.png"
          alt="empty wallet"
          className="h-32 opacity-30"
        />
        <p className="mt-2">Empty E-Wallet</p>
      </div>

      {/* Wallet Info */}
      <div className="mt-6 text-sm text-gray-700 space-y-1">
        <p>Withdrawal time : <span className="font-semibold">24 hours</span></p>
        <p>
          Daily withdrawal 99 (Times), Remaining withdrawal 99 (Times)
        </p>
        <p>Main Wallet : <span className="font-semibold">৳ 0.00</span></p>
        <p>Available Amount : <span className="font-semibold">৳ 0.00</span></p>
      </div>

      <button className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md flex items-center text-sm">
        <IoMdRefresh className="mr-1" /> Recall Balance
      </button>

      {/* Withdraw Form */}
      <div className="mt-6">
        <h2 className="text-gray-700 font-semibold mb-2">Withdrawal Amount:</h2>

        <input
          type="number"
          placeholder="Amount (100 ~ 25,000)"
          className="w-full p-3 border border-gray-300 rounded-md mb-4 text-sm"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Transaction Password"
            className="w-full p-3 border border-gray-300 rounded-md text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            <FaEye />
          </button>
        </div>
      </div>

      {/* Add E-Wallet Button */}
      <button className="fixed bottom-24 right-4 bg-red-500 text-white p-3 rounded-full shadow-lg">
        <FaPlus />
      </button>
    </div>
    </div>
  );
};

export default Withdraw;
