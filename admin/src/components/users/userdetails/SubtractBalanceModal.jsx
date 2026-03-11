import { AiOutlineClose } from "react-icons/ai";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom"

export default function SubtractBalanceModal({ isOpen, onClose }) {
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const {id}=useParams();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = Number(amount);

    // Validation
    if (!parsedAmount || parsedAmount < 1 || parsedAmount > 1000000) {
      toast.error("Amount must be between 1 and 10,000 BDT");
      return;
    }
    if (!remark.trim()) {
      toast.error("Remark is required");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${base_url}/admin/subtract-user-balance/${id}`, {
        amount: parsedAmount,
        remark,
      });
      toast.success(response.data.message || "Balance subtracted successfully");
      setAmount("");
      setRemark("");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center font-bai bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-[90%] lg:w-[70%] xl:w-[30%]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Subtract Balance</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <AiOutlineClose className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            {/* Amount Field */}
            <div className="mb-4">
              <label className="block text-[16px] mb-[4px] font-medium text-gray-700">Amount *</label>
              <div className="flex border rounded-md overflow-hidden">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Please provide positive amount"
                  className="w-full p-2 outline-none text-gray-700"
                  disabled={loading}
                />
                <span className="bg-gray-200 px-3 py-2 text-gray-700">BDT</span>
              </div>
            </div>

            {/* Remark Field */}
            <div className="mb-4">
              <label className="block text-[16px] mb-[4px] font-medium text-gray-700">Remark *</label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Remark"
                className="w-full p-2 border h-[200px] rounded-md outline-none text-gray-700"
                rows="3"
                disabled={loading}
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-2 rounded-md text-white ${loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
