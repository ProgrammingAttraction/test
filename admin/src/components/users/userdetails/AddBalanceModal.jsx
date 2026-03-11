import { AiOutlineClose } from "react-icons/ai";
import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom"

export default function AddBalanceModal({ isOpen, onClose }) {
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [balanceType, setBalanceType] = useState("main"); // Changed default to "main"
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Updated balance type options to match backend
  const balanceTypeOptions = [
    { value: "main", label: "Main Balance" },
    { value: "bonus", label: "Bonus Balance" },
    { value: "referral", label: "Referral Earnings" }
    // Remove other options or map them accordingly
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount < 1 || parsedAmount > 10000) {
      toast.error("Amount must be between 1 and 10,000 BDT");
      return;
    }
    if (!remark.trim()) {
      toast.error("Remark is required");
      return;
    }
    if (!balanceType) {
      toast.error("Please select a balance type");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${base_url}/admin/add-user-balance/${id}`, { 
        amount: parsedAmount, 
        remark,
        balanceType // This now sends "main", "bonus", or "referral"
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();
        onClose();
        // Optional: Refresh user data or trigger update
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Add balance error:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setRemark("");
    setBalanceType("main"); // Reset to default
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center font-bai bg-black bg-opacity-50 z-50">
      <Toaster
        position="bottom-center"
      />
      <div className="bg-white rounded-lg shadow-lg w-[90%] lg:w-[70%] xl:w-[30%] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-800">Add Balance</h2>
          <button 
            onClick={() => {
              resetForm();
              onClose();
            }} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <AiOutlineClose className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <form className="p-4" onSubmit={handleSubmit}>
          {/* Balance Type Field */}
          <div className="mb-4">
            <label className="block text-[16px] mb-[4px] font-medium text-gray-700">
              Balance Type *
            </label>
            <select
              value={balanceType}
              onChange={(e) => setBalanceType(e.target.value)}
              className="w-full p-2 border rounded-md outline-none text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              {balanceTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the type of balance being added
            </p>
          </div>

          {/* Amount Field */}
          <div className="mb-4">
            <label className="block text-[16px] mb-[4px] font-medium text-gray-700">
              Amount *
            </label>
            <div className="flex border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Please provide positive amount"
                className="w-full p-2 outline-none text-gray-700"
                min="1"
                max="10000"
                step="0.01"
                required
              />
              <span className="bg-gray-100 px-3 py-2 text-gray-700 border-l">
                BDT
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Amount must be between 1 and 10,000 BDT
            </p>
          </div>

          {/* Remark Field */}
          <div className="mb-6">
            <label className="block text-[16px] mb-[4px] font-medium text-gray-700">
              Remark *
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter details about this transaction..."
              className="w-full p-2 border h-[150px] rounded-md outline-none text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="3"
              required
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              Provide details about why this balance is being added
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="w-1/3 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}