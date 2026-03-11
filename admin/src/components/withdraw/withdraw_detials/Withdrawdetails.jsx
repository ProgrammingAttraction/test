import React, { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaInfoCircle, FaMoneyBillWave, FaPercentage, FaCoins } from "react-icons/fa";
import { MdAccountBalance, MdAttachMoney } from "react-icons/md";
import { RiExchangeFill } from "react-icons/ri";
import Header from "../../common/Header";
import axios from "axios";
import { useParams } from "react-router-dom";
import moment from "moment";
import { toast, Toaster } from "react-hot-toast";

const Withdrawdetails = () => {
  const [withdraw_details, set_withdraw_details] = useState(null);
  const { id } = useParams();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const withdraw_info = async () => {
    try {
      const res = await axios.get(`${base_url}/admin/single-withdraw/${id}`);
      console.log(res)
      set_withdraw_details(res.data.data);
    } catch (err) {
      console.error("Error fetching withdraw details:", err);
    }
  };

  useEffect(() => {
    withdraw_info();
  }, []);

  const handleStatusChange = (id, newStatus) => {
    axios
      .put(`${base_url}/admin/withdrawals/${id}/status`, { status: newStatus })
      .then((res) => {
        set_withdraw_details((prev) => ({ ...prev, status: newStatus }));
        toast.success(`Withdraw request ${newStatus}!`);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to update status");
      });
  };

  if (!withdraw_details) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  // Calculate tax percentage
  const taxPercentage = withdraw_details.tax_amount ? (withdraw_details.tax_amount / withdraw_details.amount * 100).toFixed(2) : 0;

  return (
    <section className="w-full bg-gray-1 font-bai">
      <Header />
      <Toaster position="bottom-center" />
      <div className="p-6 w-full flex flex-col">
        <h2 className="text-[25px] font-semibold mb-4 text-gray-700">
          Withdrawal Request #{withdraw_details.orderId}
        </h2>
        
        <div className="flex gap-6 w-full flex-col lg:flex-row">
          {/* Left Column - Basic Information */}
          <div className="bg-white w-full lg:w-[35%] shadow-sm rounded-lg border-[1px] border-[#eee] p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
              <FaInfoCircle className="text-blue-500" /> Transaction Summary
            </h3>
            <table className="w-full text-sm">
              <tbody>
                {[
                  { label: "Date", value: moment(withdraw_details?.createdAt).format("MMMM Do YYYY, h:mm A"), icon: <MdAttachMoney /> },
                  { label: "Player ID", value: withdraw_details.playerId, highlight: true },
                  { label: "Username", value: withdraw_details.name, highlight: true },
                  { label: "Email", value: withdraw_details.email, highlight: true },
                  { label: "Method", value: withdraw_details.provider, bold: true },
                  { label: "Requested Amount", value: `৳${withdraw_details.amount.toFixed(2)} BDT`, bold: true, icon: <FaMoneyBillWave /> },
                  { label: "Tax Amount", value: `৳${withdraw_details.tax_amount.toFixed(2)} BDT (${taxPercentage}%)`, icon: <FaPercentage /> },
                  { label: "Received Amount", value: `৳${withdraw_details.recieved_amount.toFixed(2)} BDT`, bold: true, icon: <MdAccountBalance /> },
                  { label: "Post Balance", value: `৳${withdraw_details.post_balance.toFixed(2)} BDT`, icon: <FaCoins /> },
                  { label: "Wagering Status", value: withdraw_details.wagering_status || "N/A", icon: <RiExchangeFill /> }
                ].map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 font-medium text-[16px] text-gray-700 flex items-center gap-2">
                      {item.icon && <span className="text-gray-500">{item.icon}</span>}
                      {item.label}
                    </td>
                    <td className={`py-2 text-right text-[16px] ${item.bold ? "font-bold" : ""} ${item.highlight ? "text-blue-500" : "text-gray-900"}`}>
                      {item.value}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-3 font-medium text-gray-700 text-[16px] flex items-center gap-2">
                    <FaInfoCircle className="text-gray-500" /> Status
                  </td>
                  <td className="py-2 text-right text-[16px]">
                    <span className={`px-3 py-1 text-[15px] font-semibold rounded-full ${withdraw_details.status === "pending" ? "text-orange-600 bg-orange-100" : withdraw_details.status === "approved" ? "text-green-600 bg-green-100" : withdraw_details.status === "in review" ? "text-yellow-500 bg-yellow-100" : "text-red-600 bg-red-100"}`}>
                      {withdraw_details.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-gray-700 text-[16px]">Last Updated</td>
                  <td className="py-2 text-right text-[16px] text-gray-900">
                    {moment(withdraw_details?.updatedAt).format("MMMM Do YYYY, h:mm A")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right Column - Payment Details and Actions */}
          <div className="bg-white shadow-sm w-full lg:w-[65%] rounded-lg p-6 border-[1px] border-[#eee] flex flex-col">
            <div className="flex-1">
              <h3 className="text-[20px] font-semibold mb-4 text-gray-700">Payment Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-[17px] mb-3 font-medium text-gray-700">Withdrawal Method</h4>
                  <p className="text-gray-900">{withdraw_details?.provider}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-[17px] mb-3 font-medium text-gray-700">Account Number</h4>
                  <p className="text-gray-900">{withdraw_details?.payeeAccount}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-[17px] mb-3 font-medium text-gray-700">Transaction ID</h4>
                  <p className="text-gray-900">{withdraw_details?.orderId}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-[17px] mb-3 font-medium text-gray-700">Bonus Information</h4>
                  <p className="text-gray-900">
                    {withdraw_details.had_active_bonus ? 
                      `Bonus: ৳${withdraw_details.bonus_amount.toFixed(2)} (${withdraw_details.bonus_cancelled ? "Cancelled" : "Active"})` : 
                      "No active bonus"}
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-[17px] mb-2 font-medium text-blue-700">Transaction Breakdown</h4>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700">Requested Amount:</span>
                  <span className="font-medium">৳{withdraw_details.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700">Tax ({taxPercentage}%):</span>
                  <span className="text-red-500">-৳{withdraw_details.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-blue-100">
                  <span className="text-gray-700 font-semibold">User Receives:</span>
                  <span className="text-green-600 font-bold">৳{withdraw_details.recieved_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-[17px] mb-3 font-medium text-gray-700">Manage Withdrawal</h4>
              <div className="flex flex-wrap gap-4">
                {withdraw_details.status === "pending" || withdraw_details.status === "in review" ? (
                  <>
                    <button 
                      onClick={() => handleStatusChange(id, "approved")} 
                      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-[4px] text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      <FaCheck /> Approve Request
                    </button>
                    <button 
                      onClick={() => handleStatusChange(id, "rejected")} 
                      className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-[4px] text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      <FaTimes /> Reject Request
                    </button>
                    <button 
                      onClick={() => handleStatusChange(id, "in review")} 
                      className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-[4px] text-sm font-medium hover:bg-yellow-600 transition-colors"
                    >
                      <FaInfoCircle /> Mark as In Review
                    </button>
                  </>
                ) : (
                  <div className="text-gray-600">
                    This withdrawal has already been {withdraw_details.status}. To change status, please contact support.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Withdrawdetails;