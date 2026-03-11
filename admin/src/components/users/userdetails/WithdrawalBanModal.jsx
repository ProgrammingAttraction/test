import { useState } from "react";
import { IoClose } from "react-icons/io5";

const WithdrawalBanModal = ({ 
  isOpen, 
  onClose, 
  userId, 
  currentStatus, 
  banReason, 
  banDate, 
  unbanDate, 
  onAction 
}) => {
  const [action, setAction] = useState(currentStatus ? "unban" : "ban");
  const [reason, setReason] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await onAction(action, reason, parseInt(durationDays));
      
      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setTimeout(() => {
          onClose();
          setReason("");
          setDurationDays("");
          setMessage({ type: "", text: "" });
        }, 1500);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black text-gray-700 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {currentStatus ? "Withdrawal Unban User" : "Withdrawal Ban User"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-4">
          {currentStatus && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-medium text-yellow-800">Current Ban Status</h3>
              <p className="text-sm text-yellow-700">Reason: {banReason || "Not specified"}</p>
              <p className="text-sm text-yellow-700">Banned on: {new Date(banDate).toLocaleString()}</p>
              {unbanDate && (
                <p className="text-sm text-yellow-700">
                  Auto unban on: {new Date(unbanDate).toLocaleString()}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Action
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="ban"
                    checked={action === "ban"}
                    onChange={() => setAction("ban")}
                    className="mr-2"
                  />
                  Ban Withdrawal
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="unban"
                    checked={action === "unban"}
                    onChange={() => setAction("unban")}
                    className="mr-2"
                  />
                  Unban Withdrawal
                </label>
              </div>
            </div>

            {action === "ban" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Ban Duration (days)
                </label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Leave empty for permanent ban"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for permanent ban
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                rows="3"
                placeholder="Enter reason for this action"
                required
              />
            </div>

            {message.text && (
              <div className={`mb-4 p-3 rounded ${
                message.type === "success" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {message.text}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded text-white ${
                  action === "ban" 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-green-600 hover:bg-green-700"
                } disabled:opacity-50`}
              >
                {loading ? "Processing..." : action === "ban" ? "Ban Withdrawal" : "Unban Withdrawal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalBanModal;