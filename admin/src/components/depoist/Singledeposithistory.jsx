import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import moment from "moment";
import axios from "axios";
import Header from "../common/Header";
import { FaCheckCircle, FaClock, FaTimesCircle, FaRegCreditCard } from "react-icons/fa";
import { useParams } from "react-router-dom";

const SingleDepositHistory = () => {
  const [deposits, setDeposits] = useState([]);
  const [filteredDeposits, setFilteredDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const { id } = useParams();

  // Fetch deposits
  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${base_url}/admin/single-user-deposits/${id}`);
      const data = response.data.data || [];
      setDeposits(data);
      setFilteredDeposits(data); // Initialize filtered deposits with all data
    } catch (error) {
      console.error("Error fetching deposits:", error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let result = [...deposits];

    // Apply date filter
    if (startDate || endDate) {
      result = result.filter(deposit => {
        const depositDate = moment(deposit.createdAt).format("YYYY-MM-DD");
        const meetsStartDate = !startDate || depositDate >= startDate;
        const meetsEndDate = !endDate || depositDate <= endDate;
        return meetsStartDate && meetsEndDate;
      });
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(deposit => 
        (deposit.customer_name && deposit.customer_name.toLowerCase().includes(query)) ||
        (deposit.transaction_id && deposit.transaction_id.toLowerCase().includes(query))
      );
    }

    setFilteredDeposits(result);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDeposits();
  }, []);

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [startDate, endDate, searchQuery, deposits]);

  const statusIcons = {
    success: <FaCheckCircle size={24} className="text-green-500" />,
    pending: <FaClock size={24} className="text-yellow-500" />,
    rejected: <FaTimesCircle size={24} className="text-red-500" />,
    initiated: <FaRegCreditCard size={24} className="text-gray-400" />,
  };

  // Calculate total amounts for each status
  const calculateTotal = (status) => {
    return filteredDeposits
      .filter(d => d.status === status)
      .reduce((acc, d) => acc + (d.amount || 0), 0)
      .toFixed(2);
  };

  return (
    <div className="w-full font-bai overflow-y-auto">
      <Header />
      <section className="p-6">
        {/* Search and Filters */}
        <div className="flex justify-between items-center my-4">
          <h2 className="text-xl font-semibold text-gray-800">Deposit History</h2>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Username / TRX"
              className="border px-4 py-2 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="bg-indigo-600 p-3 text-white rounded-lg">
              <FiSearch />
            </button>
          </div>
          <div className="flex gap-3 text-gray-800">
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
              onClick={applyFilters} 
              className="bg-indigo-600 px-4 py-2 text-white rounded-md"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Deposit Cards */}
        <div className="w-full">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {["success", "pending", "rejected", "initiated"].map((status) => (
              <div key={status} className="bg-white border-[2px] border-[#eee] shadow-sm p-4 py-[20px] rounded-md flex items-center gap-4">
                <div className="p-3 rounded-full bg-[#2A2F45]">{statusIcons[status]}</div>
                <div>
                  <p className="text-gray-800 text-sm capitalize">{status} Deposit</p>
                  <p className="text-gray-800 text-lg font-semibold">
                    ৳{calculateTotal(status)} BDT
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-gray-600 text-center mt-4">Loading...</p>
          ) : (
            <table className="w-full border-collapse shadow-xl bg-white border-[1px] border-[#eee] rounded-md overflow-hidden">
              <thead>
                <tr className="bg-[#4634FF] text-white">
                  <th className="py-3 px-4 text-left">Gateway</th>
                  <th className="py-3 px-4 text-left">Method | Transaction</th>
                  <th className="py-3 px-4 text-left">Initiated</th>
                  <th className="py-3 px-4 text-left">User</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeposits.length > 0 ? (
                  filteredDeposits.map((deposit, index) => (
                    <tr key={index} className="border-b even:bg-gray-50">
                      <td>
                        <span className="text-purple-600 font-semibold cursor-pointer hover:underline">
                          CredixoPay
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-800">
                        {deposit.payment_method} | {deposit.payment_type}
                      </td>
                      <td className="py-3 px-4 text-gray-800">
                        {moment(deposit.createdAt).format("MMMM Do YYYY, h:mm A")}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-gray-700">{deposit?.customer_email}</span>
                        <div className="text-blue-600 cursor-pointer hover:underline">
                          {deposit?.customer_name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-800">৳{deposit.amount}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-md text-sm
                            ${deposit.status === "success" ? "bg-green-100 text-green-600" : ""}
                            ${deposit.status === "failed" || deposit.status === "rejected" ? "bg-red-100 text-red-600" : ""}
                            ${deposit.status === "pending" ? "bg-yellow-100 text-yellow-600" : ""}
                            ${deposit.status === "initiated" ? "bg-gray-100 text-gray-600" : ""}
                          `}
                        >
                          {deposit.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-800">⚙️</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-600 py-4">
                      No deposits found.
                    </td>
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

export default SingleDepositHistory;