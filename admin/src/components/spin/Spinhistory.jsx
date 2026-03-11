import React, { useState, useEffect } from "react";
import { FaFilter, FaInfoCircle, FaDice } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import moment from "moment";
import axios from "axios";
import { FiSearch, FiRefreshCw, FiUser, FiClock, FiDownload, FiAward } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import Header from "../common/Header";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import * as XLSX from 'xlsx';

const Spinhistory = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [spinHistory, setSpinHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const admin_info = JSON.parse(localStorage.getItem("admin"));
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Status options for dropdown
  const statusOptions = [
    { value: "won", label: "Won", color: "bg-emerald-100 text-emerald-800" },
    { value: "lost", label: "Lost", color: "bg-rose-100 text-rose-800" },
  ];

  // Status Colors and Icons
  const statusConfig = {
    won: {
      color: "bg-emerald-100 text-emerald-800",
      icon: <FiAward className="mr-1" />,
    },
    lost: {
      color: "bg-rose-100 text-rose-800",
      icon: <FaInfoCircle className="mr-1" />,
    },
  };

  // Fetch all spin history from API
  const fetchSpinHistory = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${base_url}/admin/spin-history`);
      setSpinHistory(res.data.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch spin history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpinHistory();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, fromDate, toDate, rowsPerPage]);

  // Toggle row expansion
  const toggleRow = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  const filteredSpinHistory = spinHistory.filter((spin) => {
    const matchesSearch = Object.values(spin).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesStatus = !selectedStatus || spin.status === selectedStatus;
    const spinDate = moment(spin.spinDate || spin.createdAt);
    const matchesFrom = !fromDate || spinDate.isSameOrAfter(moment(fromDate), 'day');
    const matchesTo = !toDate || spinDate.isSameOrBefore(moment(toDate), 'day');
    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  // Calculate total statistics
  const totalSpins = filteredSpinHistory.length;
  const totalWon = filteredSpinHistory.filter(spin => spin.status === "won").length;
  const totalLost = filteredSpinHistory.filter(spin => spin.status === "lost").length;
  const totalAmountWon = filteredSpinHistory
    .filter(spin => spin.status === "won")
    .reduce((sum, spin) => {
      // Extract numeric value from result string like "Won ৳1"
      const amountMatch = spin.result?.match(/\d+/);
      return sum + (amountMatch ? parseInt(amountMatch[0]) : 0);
    }, 0);

  const winRate = totalSpins > 0 ? ((totalWon / totalSpins) * 100).toFixed(1) : 0;

  const totalPages = Math.ceil(filteredSpinHistory.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentSpins = filteredSpinHistory.slice(indexOfFirst, indexOfLast);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleRowsPerPageChange = (e) => {
    const val = e.target.value;
    setRowsPerPage(val === 'All' ? 999999 : Number(val));
  };

  const rowsPerPageValue = rowsPerPage === 999999 ? 'All' : rowsPerPage;

  const handleExport = () => {
    const dataToExport = filteredSpinHistory.map((spin) => ({
      "Transaction ID": spin.transactionId,
      "Spin Date": moment(spin.spinDate || spin.createdAt).format("MMM D, YYYY h:mm A"),
      "Player ID": spin.player_id,
      "User ID": spin.userId?._id || spin.userId,
      "Amount": spin.amount,
      "Result": spin.result,
      "Status": spin.status,
      "Created At": moment(spin.createdAt).format("MMM D, YYYY h:mm A"),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SpinHistory");
    XLSX.writeFile(wb, "spin-history.xlsx");
  };

  // Extract amount from result string
  const getAmountFromResult = (result) => {
    if (!result) return 0;
    const amountMatch = result.match(/\d+/);
    return amountMatch ? parseInt(amountMatch[0]) : 0;
  };

  return (
    <div className="w-full font-bai overflow-y-auto min-h-screen">
      <Header />
      <Toaster position="top-right" />
      <section className="md:p-6">
        <div className="overflow-hidden">
          <div className="">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Spin Wheel History</h1>
                <p className="text-gray-500 text-sm mt-1">
                  View and analyze all spin wheel transactions
                </p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <FaDice className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Total Spins</h3>
                  <p className="text-2xl font-bold text-blue-700">{totalSpins}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <FiAward className="text-emerald-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Total Wins</h3>
                  <p className="text-2xl font-bold text-emerald-700">{totalWon}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4">
                <div className="p-2 bg-rose-100 rounded-full">
                  <FaInfoCircle className="text-rose-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Total Losses</h3>
                  <p className="text-2xl font-bold text-rose-700">{totalLost}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <FaBangladeshiTakaSign className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Win Rate</h3>
                  <p className="text-2xl font-bold text-purple-700">{winRate}%</p>
                </div>
              </div>
            </div>

            {/* Total Amount Won Card */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-4 rounded-lg text-white flex items-center gap-4">
                <div className="p-2 bg-white bg-opacity-20 rounded-full">
                  <FaBangladeshiTakaSign className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Total Amount Won</h3>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalAmountWon)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6 items-end">
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search spins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="min-w-[150px]">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  <option value="">All Status</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-[150px]">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  placeholder="From Date"
                  className="w-full p-2 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
              <div className="min-w-[150px]">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  placeholder="To Date"
                  className="w-full p-2 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
              <button
                onClick={fetchSpinHistory}
                className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <FiRefreshCw className={`text-gray-600 ${isLoading ? "animate-spin" : ""}`} />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 text-gray-700">
              <table className="w-full border-collapse bg-white overflow-hidden">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="p-4 text-left font-medium">Spin Details</th>
                    <th className="p-4 text-left font-medium">Player Info</th>
                    <th className="p-4 text-left font-medium">Amount & Result</th>
                    <th className="p-4 text-left font-medium">Status</th>
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500 flex justify-center items-center w-full h-full">
                        <div className="flex justify-center">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-purple-500 border-b-purple-500 border-l-transparent border-r-transparent"></div>
                            <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-purple-500/20 blur-sm"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : currentSpins.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        No spin history found
                      </td>
                    </tr>
                  ) : (
                    currentSpins.map((spin, index) => (
                      <React.Fragment key={index}>
                        <tr
                          className={`border-b even:bg-gray-50 hover:bg-gray-100 cursor-pointer ${
                            expandedRow === spin._id ? "bg-purple-50" : ""
                          }`}
                          onClick={() => toggleRow(spin._id)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-purple-100 rounded-full">
                                <FaDice className="text-purple-600" />
                              </div>
                              <div>
                                <div className="font-semibold">
                                  {spin.transactionId}
                                </div>
                                <div className="text-gray-500 text-sm">
                                  {moment(spin.spinDate || spin.createdAt).format("MMM D, YYYY h:mm A")}
                                </div>
                                <div className="text-gray-500 text-sm">
                                  Spin Amount: {formatCurrency(spin.amount)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <FiUser className="text-gray-500" />
                              <div>
                                <div className="font-semibold">
                                  Player ID: {spin.player_id}
                                </div>
                                <div className="text-gray-500 text-sm">
                                  User ID: {typeof spin.userId === 'object' ? spin.userId?._id : spin.userId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-semibold">
                                  {spin.result}
                                </div>
                                <div className="text-gray-500 text-sm">
                                  Base Amount: {formatCurrency(spin.amount)}
                                </div>
                                {spin.status === "won" && (
                                  <div className="text-emerald-500 text-sm font-medium">
                                    +{formatCurrency(getAmountFromResult(spin.result))} won
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                statusConfig[spin.status]?.color || "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {statusConfig[spin.status]?.icon}
                              {spin.status.charAt(0).toUpperCase() + spin.status.slice(1)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <NavLink
                                to={`/spin-history/details/${spin._id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition text-sm">
                                  <FaInfoCircle size={12} /> Details
                                </button>
                              </NavLink>
                            </div>
                          </td>
                        </tr>
                        {expandedRow === spin._id && (
                          <tr className="bg-purple-50">
                            <td colSpan="5" className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow">
                                  <h3 className="font-semibold mb-2 text-gray-700">
                                    Spin Details
                                  </h3>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Transaction ID:</span>
                                      <span className="font-mono">{spin.transactionId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Spin Date:</span>
                                      <span>
                                        {moment(spin.spinDate || spin.createdAt).format(
                                          "MMM D, YYYY h:mm A"
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Created:</span>
                                      <span>
                                        {moment(spin.createdAt).format(
                                          "MMM D, YYYY h:mm A"
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Last Updated:</span>
                                      <span>
                                        {moment(spin.updatedAt).format(
                                          "MMM D, YYYY h:mm A"
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow">
                                  <h3 className="font-semibold mb-2 text-gray-700">
                                    Amount Breakdown
                                  </h3>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Spin Amount:</span>
                                      <span>{formatCurrency(spin.amount)}</span>
                                    </div>
                                    {spin.status === "won" && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Won Amount:</span>
                                        <span className="text-emerald-500 font-medium">
                                          +{formatCurrency(getAmountFromResult(spin.result))}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between border-t pt-2">
                                      <span className="text-gray-500 font-medium">
                                        Net Result:
                                      </span>
                                      <span className={`font-medium ${
                                        spin.status === "won" ? "text-emerald-600" : "text-rose-600"
                                      }`}>
                                        {spin.status === "won" ? "+" : "-"}{formatCurrency(spin.amount)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow">
                                  <h3 className="font-semibold mb-2 text-gray-700">
                                    Player Information
                                  </h3>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Player ID:</span>
                                      <span>{spin.player_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">User ID:</span>
                                      <span className="font-mono">
                                        {typeof spin.userId === 'object' ? spin.userId?._id : spin.userId}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Status:</span>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        statusConfig[spin.status]?.color
                                      }`}>
                                        {spin.status.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow">
                                  <h3 className="font-semibold mb-2 text-gray-700">
                                    Result Summary
                                  </h3>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Result:</span>
                                      <span className={`font-medium ${
                                        spin.status === "won" ? "text-emerald-600" : "text-rose-600"
                                      }`}>
                                        {spin.result}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Status:</span>
                                      <span>{spin.status}</span>
                                    </div>
                                    {spin.__v !== undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Version:</span>
                                        <span>{spin.__v}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredSpinHistory.length > 0 && (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 py-3 border-gray-200 gap-4">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(currentPage * rowsPerPage, filteredSpinHistory.length)}</span> of{" "}
                  <span className="font-medium">{filteredSpinHistory.length}</span> results
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span>Rows per page:</span>
                    <select
                      value={rowsPerPageValue}
                      onChange={handleRowsPerPageChange}
                      className="p-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value="All">All</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Spinhistory;