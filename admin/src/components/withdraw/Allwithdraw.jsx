import React, { useState, useEffect } from "react";
import { FaRegCommentDots, FaMoneyBillWave, FaInfoCircle, FaPlus } from "react-icons/fa";
import { FiSearch, FiClock, FiUser, FiRefreshCw, FiDownload, FiX } from "react-icons/fi";
import { MdPayment, MdCancel, MdCheckCircle } from "react-icons/md";
import { NavLink } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import Header from "../common/Header";
import { nanoid } from "nanoid";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from 'xlsx';

const Allwithdraw = () => {
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const base_url2 = import.meta.env.VITE_API_KEY_Base_URL2;
  const [orderId, setOrderId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [manualWithdrawOpen, setManualWithdrawOpen] = useState(false);
  const [manualWithdrawData, setManualWithdrawData] = useState({
    playerId: "",
    email: "",
    amount: "",
    provider: "manual",
    payeeAccount: "",
    description: "",
    tax_amount: "0"
  });

  // Status options for dropdown
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in review", label: "In Review" },
    { value: "approved", label: "Approved" },
    { value: "success", label: "Success" },
    { value: "rejected", label: "Rejected" },
  ];

  // Status Colors and Icons
  const statusConfig = {
    pending: {
      color: "bg-orange-100 text-orange-600",
      icon: <FiClock className="mr-1" />,
    },
    "in review": {
      color: "bg-yellow-100 text-yellow-600",
      icon: <FaInfoCircle className="mr-1" />,
    },
    approved: {
      color: "bg-indigo-100 text-indigo-600",
      icon: <MdCheckCircle className="mr-1" />,
    },
    success: {
      color: "bg-green-100 text-green-600",
      icon: <MdCheckCircle className="mr-1" />,
    },
    rejected: {
      color: "bg-red-100 text-red-600",
      icon: <MdCancel className="mr-1" />,
    },
  };

  // Fetch Pending Withdrawals
  const fetchWithdrawals = () => {
    setLoading(true);
    axios
      .get(`${base_url}/admin/all-withdrawals`)
      .then((res) => {
        setPendingWithdrawals(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to fetch withdrawals");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWithdrawals();
    setOrderId(nanoid(8));
  }, []);

  useEffect(() => {
    if (pendingWithdrawals.length > 0) {
      const uniqueProviders = [...new Set(pendingWithdrawals.map(w => w.provider))];
      setProviders(uniqueProviders);
    }
  }, [pendingWithdrawals]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedProvider, fromDate, toDate, rowsPerPage]);

  // Toggle row expansion
  const toggleRow = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  // Handle Status Change
  const handleStatusChange = (id, newStatus, withdrawal) => {
    const config = {
      headers: {
        'x-api-key': '18e5f948356de68e2909'
      }
    };

    axios
      .put(
        `${base_url}/admin/withdrawals/${id}/status`, 
        { status: newStatus },
        config
      )
      .then((res) => {
        if (newStatus === "approved") {
          if (res.data.payoutInitiated) {
            toast.success("Withdrawal approved and payout initiated successfully.");
          } else if (res.data.statusReverted) {
            toast.error(`Payout failed: ${res.data.error}`);
          }
        } else if (newStatus === "rejected") {
          toast.success("Withdrawal rejected successfully. Balance refunded.");
        } else {
          toast.success("Withdrawal status updated successfully.");
        }
        
        // Refresh the data to show updated status
        fetchWithdrawals();
      })
      .catch((err) => {
        console.log(err);
        if (err.response && err.response.data) {
          const errorMsg = err.response.data.statusReverted 
            ? `Payout failed - Status reverted: ${err.response.data.error}`
            : err.response.data.message;
          toast.error(errorMsg);
        } else {
          toast.error("Error updating status.");
        }
        
        // Refresh data even on error to ensure UI is in sync
        fetchWithdrawals();
      });
  };

  // Handle Manual Withdrawal
  const handleManualWithdraw = async () => {
    if (!manualWithdrawData.playerId || !manualWithdrawData.amount || !manualWithdrawData.email) {
      toast.error("Player ID, Email and Amount are required!");
      return;
    }

    if (parseFloat(manualWithdrawData.amount) <= 0) {
      toast.error("Amount must be greater than 0!");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${base_url}/admin/manual-withdrawal`,
        {
          ...manualWithdrawData,
          amount: parseFloat(manualWithdrawData.amount),
          tax_amount: parseFloat(manualWithdrawData.tax_amount) || 0,
          recieved_amount: parseFloat(manualWithdrawData.amount) - (parseFloat(manualWithdrawData.tax_amount) || 0),
          status: "success", // Manual withdrawals are immediately successful
          orderId: `MANUAL_${nanoid(8)}`,
          added_by: JSON.parse(localStorage.getItem("admin"))?.email || "admin"
        }
      );
      
      toast.success("Manual withdrawal added successfully!");
      setManualWithdrawOpen(false);
      setManualWithdrawData({
        playerId: "",
        email: "",
        amount: "",
        provider: "manual",
        payeeAccount: "",
        description: "",
        tax_amount: "0"
      });
      fetchWithdrawals(); // Refresh data
    } catch (error) {
      console.error("Manual withdrawal error:", error);
      toast.error(error.response?.data?.message || "Failed to add manual withdrawal");
    } finally {
      setLoading(false);
    }
  };

  // Filter Withdrawals Based on Search Query and Filters
  const filteredWithdrawals = pendingWithdrawals.filter((transaction) => {
    const matchesSearch = Object.values(transaction).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesStatus = !selectedStatus || transaction.status === selectedStatus;
    const matchesProvider = !selectedProvider || transaction.provider === selectedProvider;
    const transactionDate = moment(transaction.createdAt);
    const matchesFrom = !fromDate || transactionDate.isSameOrAfter(moment(fromDate), 'day');
    const matchesTo = !toDate || transactionDate.isSameOrBefore(moment(toDate), 'day');
    return matchesSearch && matchesStatus && matchesProvider && matchesFrom && matchesTo;
  });

  // Calculate total successful and approved withdrawal amounts (excluding manual)
  const totalSuccessAmount = filteredWithdrawals
    .filter((transaction) => transaction.status === "success" && transaction.provider !== "manual")
    .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);

  const totalApprovedAmount = filteredWithdrawals
    .filter((transaction) => transaction.status === "approved" && transaction.provider !== "manual")
    .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);

  // Calculate total manual withdrawal amount
  const totalManualAmount = filteredWithdrawals
    .filter((transaction) => transaction.provider === "manual")
    .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);

  const totalPages = Math.ceil(filteredWithdrawals.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentWithdrawals = filteredWithdrawals.slice(indexOfFirst, indexOfLast);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleRowsPerPageChange = (e) => {
    const val = e.target.value;
    setRowsPerPage(val === 'All' ? 999999 : Number(val));
  };

  const rowsPerPageValue = rowsPerPage === 999999 ? 'All' : rowsPerPage;

  const handleExport = () => {
    const dataToExport = filteredWithdrawals.map((transaction) => ({
      "Order ID": transaction.orderId,
      "Date": moment(transaction.createdAt).format("MMM D, YYYY h:mm A"),
      "Provider": transaction.provider.toUpperCase(),
      "Email": transaction.email,
      "Player ID": transaction.playerId,
      "Payee Account": transaction.payeeAccount,
      "Amount": transaction.amount,
      "Tax/Fee": transaction.tax_amount,
      "Received Amount": transaction.recieved_amount,
      "Status": transaction.status,
      "Post Balance": transaction.post_balance,
      "Had Active Bonus": transaction.had_active_bonus ? "Yes" : "No",
      "Type": transaction.provider === "manual" ? "Manual" : "Automatic"
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Withdrawals");
    XLSX.writeFile(wb, "withdrawals.xlsx");
  };

  return (
    <div className="w-full font-bai overflow-y-auto">
      <Header />
      <Toaster position="top-right" />
      <section className="">
        <div className="">
          <div className="w-full p-4 bg-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Withdrawal Management</h1>
                <p className="text-gray-500">
                  {filteredWithdrawals.length} total withdrawals
                </p>
              </div>
            </div>

            {/* Total Withdrawals Cards */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <MdCheckCircle className="text-green-600 text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-600">Successful Withdrawals</h3>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(totalSuccessAmount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatic withdrawals only
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg  border border-gray-200 flex items-center gap-4">
                <div className="p-2 bg-indigo-100 rounded-full">
                  <MdCheckCircle className="text-indigo-600 text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-600">Approved Withdrawals</h3>
                  <p className="text-2xl font-bold text-indigo-700">
                    {formatCurrency(totalApprovedAmount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pending payout processing
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <FaMoneyBillWave className="text-purple-600 text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-600">Manual Withdrawals</h3>
                  <p className="text-2xl font-bold text-purple-700">
                    {formatCurrency(totalManualAmount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Admin processed withdrawals
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6 items-end">
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search by user, gateway, amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full p-2 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  <option value="">All Providers</option>
                  {providers.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider.toUpperCase()}
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
                onClick={fetchWithdrawals}
                className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <FiRefreshCw className={`text-gray-600 ${loading ? "animate-spin" : ""}`} />
                <span className="text-sm font-medium">Refresh</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-[5px] text-white bg-teal-600 border transition"
              >
                <FiDownload />
                <span className="text-sm font-medium">Export to Excel</span>
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
                  <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-cyan-500/20 blur-sm"></div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto text-gray-700 border-[1px] bordr-gray-200">
                <table className="w-full border-collapse bg-white overflow-hidden">
                  <thead>
                    <tr className="bg-cyan-600 text-white">
                      <th className="p-3 text-left">Details</th>
                      <th className="p-3 text-left">User</th>
                      <th className="p-3 text-left">Amount</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentWithdrawals.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-gray-500">
                          No withdrawals found
                        </td>
                      </tr>
                    ) : (
                      currentWithdrawals.map((transaction, index) => (
                        <React.Fragment key={index}>
                          <tr
                            className={`border-b even:bg-gray-50 hover:bg-gray-100 cursor-pointer ${
                              expandedRow === transaction._id ? "bg-blue-50" : ""
                            }`}
                            onClick={() => toggleRow(transaction._id)}
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-full ${
                                  transaction.provider === "manual" ? "bg-purple-100 border-[1px] border-purple-400" : "bg-blue-100 border-[1px] border-blue-400"
                                }`}>
                                  <MdPayment className={
                                    transaction.provider === "manual" ? "text-purple-600 border-[1px] border-purple-400" : "text-blue-600 border-[1px] border-blue-400"
                                  } />
                                </div>
                                <div>
                                  <div className="font-semibold">
                                    {transaction.provider.toUpperCase()}
                                  </div>
                                  <div className="text-gray-500 text-sm">
                                    {moment(transaction.createdAt).format("MMM D, YYYY h:mm A")}
                                  </div>
                                  <div className="text-gray-500 text-sm">
                                    {transaction.orderId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <FiUser className="text-gray-500" />
                                <div>
                                  <div className="font-semibold">
                                    {transaction.email}
                                  </div>
                                  <div className="text-gray-500 text-sm">
                                    ID: {transaction.playerId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="font-semibold">
                                    {formatCurrency(transaction.amount)}
                                  </div>
                                  <div className="text-gray-500 text-sm">
                                    Net: {formatCurrency(transaction.recieved_amount)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  statusConfig[transaction.status]?.color || "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {statusConfig[transaction.status]?.icon}
                                {transaction.status.charAt(0).toUpperCase() +
                                  transaction.status.slice(1)}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                transaction.provider === "manual" 
                                  ? "bg-purple-100 text-purple-800 border-[1px] border-purple-400" 
                                  : "bg-blue-100 text-blue-800 border-[1px] border-blue-400"
                              }`}>
                                {transaction.provider === "manual" ? "Manual" : "Automatic"}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <select
                                  className={`px-3 py-1 rounded-md border-[1px] border-gray-200 text-sm ${
                                    statusConfig[transaction.status]?.color || "bg-gray-100"
                                  }`}
                                  value={transaction.status}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      transaction._id,
                                      e.target.value,
                                      transaction
                                    )
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  disabled={
                                    transaction.status === "approved" ||
                                    transaction.status === "success" ||
                                    transaction.status === "rejected" ||
                                    transaction.provider === "manual" // Disable status change for manual withdrawals
                                  }
                                >
                                  <option value="pending">Pending</option>
                                  <option value="in review">Review</option>
                                  <option value="approved">Approve</option>
                                  <option value="rejected">Reject</option>
                                </select>
                                <NavLink
                                  to={`/withdraw/pending-withdraw-details/${transaction._id}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition">
                                    <FaRegCommentDots /> Details
                                  </button>
                                </NavLink>
                              </div>
                            </td>
                          </tr>
                          {expandedRow === transaction._id && (
                            <tr className="bg-blue-50">
                              <td colSpan="6" className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="font-semibold mb-2 text-gray-700">
                                      Transaction Details
                                    </h3>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Order ID:</span>
                                        <span>{transaction.orderId}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Type:</span>
                                        <span className="capitalize">
                                          {transaction.provider === "manual" ? "Manual Withdrawal" : "Automatic Withdrawal"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Gateway:</span>
                                        <span className="capitalize">
                                          {transaction.provider}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Account:</span>
                                        <span>{transaction.payeeAccount || "N/A"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Initiated:</span>
                                        <span>
                                          {moment(transaction.createdAt).format(
                                            "MMM D, YYYY h:mm A"
                                          )}
                                        </span>
                                      </div>
                                      {transaction.provider === "manual" && transaction.description && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Description:</span>
                                          <span>{transaction.description}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="font-semibold mb-2 text-gray-700">
                                      Amount Breakdown
                                    </h3>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Requested:</span>
                                        <span>{formatCurrency(transaction.amount)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Tax/Fee:</span>
                                        <span className="text-red-500">
                                          -{formatCurrency(transaction.tax_amount)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between border-t pt-2">
                                        <span className="text-gray-500 font-medium">
                                          Received:
                                        </span>
                                        <span className="text-green-600 font-medium">
                                          {formatCurrency(transaction.recieved_amount)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="font-semibold mb-2 text-gray-700">
                                      User Information
                                    </h3>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Player ID:</span>
                                        <span>{transaction.playerId}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Email:</span>
                                        <span>{transaction.email}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Balance:</span>
                                        <span>{formatCurrency(transaction.post_balance)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Bonus:</span>
                                        <span>
                                          {transaction.had_active_bonus ? "Yes" : "No"}
                                        </span>
                                      </div>
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
            )}
            {filteredWithdrawals.length > 0 && (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 py-3 border-gray-200 gap-4">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(currentPage * rowsPerPage, filteredWithdrawals.length)}</span> of{" "}
                  <span className="font-medium">{filteredWithdrawals.length}</span> results
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

export default Allwithdraw;