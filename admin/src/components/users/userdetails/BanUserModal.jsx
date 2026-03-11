import { AiOutlineClose } from "react-icons/ai";
import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom"

export default function BanUserModal({ isOpen, onClose }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const {id}=useParams();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBanUser = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for banning the user.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${base_url}/admin/banned-user/${id}`, {reason });

      if (response.data.success) {
        toast.success("User has been banned successfully!");
        onClose();
      } else {
        toast.error(response.data.message || "Failed to ban the user.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong! Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-[90%] lg:w-[70%] xl:w-[30%]">
        <Toaster/>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-red-600">Ban User</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <AiOutlineClose className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="mb-4 text-[20px] text-gray-700">
            If you ban this user, he/she won't be able to access their dashboard.
          </p>

          {/* Reason for Ban */}
          <div className="mb-4">
            <label className="block text-[16px] mb-[4px] font-medium text-gray-700">
              Reason *
            </label>
            <textarea
              placeholder="Enter reason"
              className="w-full p-2 border rounded-md outline-none text-gray-700"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            ></textarea>
          </div>

          {/* Confirm and Cancel Buttons */}
          <div className="flex justify-between w-full">
            <button
              onClick={handleBanUser}
              disabled={loading}
              className={`w-full px-4 py-2 rounded-md text-white ${
                loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Banning..." : "Ban User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
