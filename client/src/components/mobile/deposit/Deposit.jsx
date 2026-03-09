import React, { useState } from 'react';
import { FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Deposit = () => {
  const [selectedMethod, setSelectedMethod] = useState('Bkash VIP');
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const navigate = useNavigate();

  const depositMethods = [
    { name: 'Bkash VIP', image: 'https://xxxbetgames.com/icons-xxx/payments/226.svg' },
    { name: 'NAGAD VIP', image: 'https://xxxbetgames.com/icons-xxx/payments/227.svg' },
  ];

  const depositAmounts = [100, 200, 300, 400, 1000, 3000, 5000, 10000, 20000, 25000];

  const handleBack = () => {
    navigate(-1); // This will take the user back to the previous page
  };

  return (
    <div className="min-h-screen bg-white  font-sans">
      {/* Header with blue background */}
      <div className="bg-theme_color2 text-white p-4 mb-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleBack}
            className="text-white text-lg font-bold"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-semibold">Deposit</h1>
        </div>
      </div>

      {/* Deposit Method */}
      <div className="mb-6 p-2">
        <h2 className="font-semibold text-gray-700 mb-2">Deposit Method</h2>
        <div className="flex gap-4">
          {depositMethods.map((method) => (
            <div
              key={method.name}
              className={`border p-2 rounded-md cursor-pointer w-[120px] text-center relative ${
                selectedMethod === method.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              onClick={() => setSelectedMethod(method.name)}
            >
              <img src={method.image} alt={method.name} className="h-10 mx-auto mb-1" />
              <p className="text-sm font-medium text-gray-800">{method.name}</p>
              {selectedMethod === method.name && (
                <FaCheckCircle className="absolute top-1 right-1 text-red-500" />
              )}
            </div>
          ))}
        </div>
        <p className="text-red-600 text-sm mt-4 leading-relaxed">
          ❗️ ❗️ ❗️ NOTE : অনুগ্রহ করে আপনার ডিপোজিট করার পরে অবশ্যই আপনার Trx-ID আইডি সাবমিট করবেন। তাহলে খুব দ্রুত আপনার একাউন্টের মধ্যে টাকা যোগ হয়ে যাবে। ⚠️⚠️⚠️
        </p>
      </div>

      {/* Payment Channels */}
      <div className="mb-6 p-2">
        <h2 className="font-semibold text-gray-700 mb-2">Payment channels</h2>
        <div className="text-sm font-semibold text-red-700">Bkash VIP | QKP</div>
        <p className="text-red-600 text-sm mt-2 leading-relaxed">
          ❗️ অনুগ্রহ করে সতর্ক থাকুন (যে সম্প্রতি ডিপোজিট পরিষেবা প্রদানের জন্য Telegram বা Facebook এর ভান করে অনেক স্ক্যামার এসেছে। আমাদের অফিসিয়াল ডিপোজিটগুলো শুধুমাত্র প্ল্যাটফর্মের মধ্যে সম্পন্ন হয়।
        </p>
      </div>

      {/* Deposit Amounts */}
      <div className="mb-6 p-2">
        <h2 className="font-semibold text-gray-700 mb-2">Deposit Amounts</h2>
        <div className="grid grid-cols-3 gap-2">
          {depositAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setSelectedAmount(amount)}
              className={`px-4 py-2 rounded-md border text-sm font-semibold ${
                selectedAmount === amount
                  ? 'bg-red-100 border-red-500 text-red-700'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              {amount.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Next Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-inner">
        <button className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-md">
          Next
        </button>
      </div>
    </div>
  );
};

export default Deposit;