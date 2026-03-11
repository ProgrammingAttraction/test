import React, { useState, useEffect } from "react";
import { FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";
import moment from "moment";
import axios from "axios";
import { FaCheckCircle, FaClock, FaTimesCircle, FaRegCreditCard } from "react-icons/fa";
import Header from "../../common/Header";
import { useParams } from "react-router-dom";

const SingleWithdrawHistory = () => {
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedWithdraw, setExpandedWithdraw] = useState(null);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const { id } = useParams();

  // Fetch withdraws
  const fetchWithdraws = async () => {
    setLoading(true);
    try {
      let url = `${base_url}/admin/single-user-withdraws/${id}`;
      
      // Add date filters if they exist
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      setWithdraws(response.data.data || []);
    } catch (error) {
      console.error("Error fetching withdraws:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchWithdraws();
  }, []);

  const statusIcons = {
    approved: <FaCheckCircle size={24} className="text-green-500" />,
    "in review": <FaClock size={24} className="text-yellow-500" />,
    rejected: <FaTimesCircle size={24} className="text-red-500" />,
    initiated: <FaRegCreditCard size={24} className="text-gray-400" />,
  };

  const toggleExpand = (id) => {
    if (expandedWithdraw === id) {
      setExpandedWithdraw(null);
    } else {
      setExpandedWithdraw(id);
    }
  };

  const filteredWithdraws = withdraws.filter((withdraw) => {
    const matchesSearch = 
      withdraw.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      withdraw.orderId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Calculate totals for each status
  const statusTotals = {
    approved: withdraws.filter(w => w.status === 'approved').reduce((acc, w) => acc + w.amount, 0),
    "in review": withdraws.filter(w => w.status === 'in review').reduce((acc, w) => acc + w.amount, 0),
    rejected: withdraws.filter(w => w.status === 'rejected').reduce((acc, w) => acc + w.amount, 0),
    initiated: withdraws.filter(w => w.status === 'success').reduce((acc, w) => acc + w.amount, 0),
  };

  return (
    <div className="w-full font-bai overflow-y-auto">
      <Header />
      <section className="p-6">
        <h2 className="text-xl font-semibold text-gray-800">Withdraw History</h2>

        {/* Search and Filters */}
        <div className="flex justify-between items-center my-4 flex-wrap gap-4 text-gray-700">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Username / Order ID"
              className="border px-4 py-2 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={fetchWithdraws} className="bg-indigo-600 p-3 text-white rounded-lg">
              <FiSearch />
            </button>
          </div>
          <div className="flex gap-3 flex-wrap">
            <input
              type="date"
              className="border px-4 py-2 rounded-lg"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="border px-4 py-2 rounded-lg"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button 
              onClick={fetchWithdraws} 
              className="bg-indigo-600 px-4 py-2 text-white rounded-md"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Withdraw Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(statusTotals).map(([status, total]) => (
            <div key={status} className="bg-white border-[2px] border-[#eee] shadow-sm p-4 py-[20px] rounded-md flex items-center gap-4">
              <div className="p-3 rounded-full bg-[#2A2F45]">{statusIcons[status]}</div>
              <div>
                <p className="text-gray-800 text-sm capitalize">{status} Withdraw</p>
                <p className="text-gray-800 text-lg font-semibold">
                  ৳{total.toFixed(2)} BDT
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-gray-600 text-center mt-4">Loading...</p>
          ) : (
            <table className="w-full border-collapse shadow-xl bg-white border-[1px] border-[#eee] rounded-md overflow-hidden">
              <thead>
                <tr className="bg-[#4634FF] text-white">
                  <th className="py-3 px-4 text-left">Order ID</th>
                  <th className="py-3 px-4 text-left">Provider</th>
                  <th className="py-3 px-4 text-left">Initiated</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredWithdraws.length > 0 ? (
                  filteredWithdraws.map((withdraw) => (
                    <React.Fragment key={withdraw._id}>
                      <tr className="border-b even:bg-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-800">{withdraw.orderId}</td>
                        <td className="py-3 px-4 text-gray-800 capitalize">{withdraw.provider}</td>
                        <td className="py-3 px-4 text-gray-800">
                          {moment(withdraw.createdAt).format("MMM D, YYYY h:mm A")}
                        </td>
                        <td className="py-3 px-4 text-gray-800">৳{withdraw.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-md text-sm
                              ${withdraw.status === "approved" ? "bg-purple-500 text-white" : ""}
                              ${withdraw.status === "rejected" ? "bg-red-500 text-white" : ""}
                              ${withdraw.status === "in review" ? "bg-yellow-100 text-yellow-600" : ""}
                              ${withdraw.status === "success" ? "bg-green-500 text-white" : ""}
                            `}
                          >
                            {withdraw.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => toggleExpand(withdraw._id)}
                            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            {expandedWithdraw === withdraw._id ? (
                              <>
                                <FiChevronUp /> Hide
                              </>
                            ) : (
                              <>
                                <FiChevronDown /> View
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                      {expandedWithdraw === withdraw._id && (
                        <tr className="bg-gray-50 text-gray-700">
                          <td colSpan="6" className="px-4 py-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white rounded-lg border">
                              <div>
                                <h3 className="font-semibold text-gray-700 mb-2">User Information</h3>
                                <p><span className="text-gray-600">Username:</span> {withdraw.username || 'N/A'}</p>
                                <p><span className="text-gray-600">Email:</span> {withdraw.email || 'N/A'}</p>
                                <p><span className="text-gray-600">Player ID:</span> {withdraw.playerId || 'N/A'}</p>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Transaction Details</h3>
                                <p><span className="text-gray-600">Order ID:</span> {withdraw.orderId}</p>
                                <p><span className="text-gray-600">Provider:</span> {withdraw.provider}</p>
                                <p><span className="text-gray-600">Account:</span> {withdraw.payeeAccount || 'N/A'}</p>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Amount Details</h3>
                                <p><span className="text-gray-600">Requested:</span> ৳{withdraw.amount.toFixed(2)}</p>
                                <p><span className="text-gray-600">Tax:</span> ৳{(withdraw.tax_amount || 0).toFixed(2)}</p>
                                <p><span className="text-gray-600">Received:</span> ৳{(withdraw.recieved_amount || 0).toFixed(2)}</p>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Dates</h3>
                                <p><span className="text-gray-600">Created:</span> {moment(withdraw.createdAt).format("MMM D, YYYY h:mm A")}</p>
                                <p><span className="text-gray-600">Updated:</span> {moment(withdraw.updatedAt).format("MMM D, YYYY h:mm A")}</p>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Status Information</h3>
                                <p><span className="text-gray-600">Status:</span> <span className="capitalize">{withdraw.status}</span></p>
                                <p><span className="text-gray-600">Updated By:</span> {withdraw.updated_by || 'System'}</p>
                                <p><span className="text-gray-600">Wagering:</span> {withdraw.wagering_status || 'N/A'}</p>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Bonus Information</h3>
                                <p><span className="text-gray-600">Had Active Bonus:</span> {withdraw.had_active_bonus ? 'Yes' : 'No'}</p>
                                <p><span className="text-gray-600">Bonus Amount:</span> ৳{(withdraw.bonus_amount || 0).toFixed(2)}</p>
                                <p><span className="text-gray-600">Bonus Cancelled:</span> {withdraw.bonus_cancelled ? 'Yes' : 'No'}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-600 py-4">No withdraws found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default SingleWithdrawHistory;