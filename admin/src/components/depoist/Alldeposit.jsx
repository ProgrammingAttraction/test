import React, { useState, useEffect } from "react";
import { FaRegCommentDots, FaFilter, FaInfoCircle, FaPlus } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import moment from "moment";
import axios from "axios";
import { FiSearch, FiRefreshCw, FiUser, FiClock, FiDownload, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import Header from "../common/Header";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import * as XLSX from 'xlsx';

const Alldeposit = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [deposits, setDeposits] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusPopupOpen, setStatusPopupOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const admin_info = JSON.parse(localStorage.getItem("admin"));
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [manualDepositOpen, setManualDepositOpen] = useState(false);
  const [manualDepositData, setManualDepositData] = useState({
    customer_id: "",
    amount: "",
    bonus_amount: "",
    payment_method: "manual",
    description: ""
  });

  // Status options for dropdown
  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-800" },
    { value: "success", label: "Success", color: "bg-emerald-100 text-emerald-800" },
    { value: "failed", label: "Failed", color: "bg-rose-100 text-rose-800" },
    { value: "processing", label: "Processing", color: "bg-blue-100 text-blue-800" },
  ];

  // Status Colors and Icons
  const statusConfig = {
    pending: {
      color: "bg-amber-100 text-amber-800",
      icon: <FiClock className="mr-1" />,
    },
    processing: {
      color: "bg-blue-100 text-blue-800",
      icon: <FaInfoCircle className="mr-1" />,
    },
    success: {
      color: "bg-emerald-100 text-emerald-800",
      icon: <FaBangladeshiTakaSign className="mr-1" />,
    },
    failed: {
      color: "bg-rose-100 text-rose-800",
      icon: <FaInfoCircle className="mr-1" />,
    },
  };

  // Fetch all deposits from API
  const fetchDeposits = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${base_url}/admin/all-deposits`);
      setDeposits(res.data.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch deposits");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  useEffect(() => {
    if (deposits.length > 0) {
      const methods = [...new Set(deposits.map(d => d.payment_method))];
      setPaymentMethods(methods);
    }
  }, [deposits]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedMethod, fromDate, toDate, rowsPerPage]);

  // Toggle row expansion
  const toggleRow = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  const filteredDeposits = deposits.filter((transaction) => {
    const matchesSearch = Object.values(transaction).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesStatus = !selectedStatus || transaction.status === selectedStatus;
    const matchesMethod = !selectedMethod || transaction.payment_method === selectedMethod;
    const transactionDate = moment(transaction.createdAt);
    const matchesFrom = !fromDate || transactionDate.isSameOrAfter(moment(fromDate), 'day');
    const matchesTo = !toDate || transactionDate.isSameOrBefore(moment(toDate), 'day');
    return matchesSearch && matchesStatus && matchesMethod && matchesFrom && matchesTo;
  });

  // Calculate total successful deposit amount (excluding manual deposits)
  const totalSuccessAmount = filteredDeposits
    .filter((transaction) => transaction.status === "success" && transaction.payment_method !== "manual")
    .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);

  // Calculate total manual deposit amount
  const totalManualAmount = filteredDeposits
    .filter((transaction) => transaction.status === "success" && transaction.payment_method === "manual")
    .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);

  const totalPages = Math.ceil(filteredDeposits.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentDeposits = filteredDeposits.slice(indexOfFirst, indexOfLast);

  // Handle status change
  const handleStatusChange = async () => {
    if (!newStatus || !reason) {
      toast.error("Both status and reason are required!");
      return;
    }

    try {
      const response = await axios.put(
        `${base_url}/admin/update-deposit-status/${selectedTransaction._id}`,
        { status: newStatus, reason, updated_by: admin_info.email }
      );
      toast.success("Status updated successfully!");
      setStatusPopupOpen(false);
      setNewStatus("");
      setReason("");
      fetchDeposits(); // Refresh data
    } catch (error) {
      toast.error("Failed to update status. Please try again.");
    }
  };

  // Handle manual deposit
  const handleManualDeposit = async () => {
    if (!manualDepositData.customer_id || !manualDepositData.amount) {
      toast.error("Customer ID and Amount are required!");
      return;
    }

    if (parseFloat(manualDepositData.amount) <= 0) {
      toast.error("Amount must be greater than 0!");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${base_url}/admin/manual-deposit`,
        {
          ...manualDepositData,
          amount: parseFloat(manualDepositData.amount),
          bonus_amount: parseFloat(manualDepositData.bonus_amount) || 0,
          status: "success",
          added_by: admin_info.email
        }
      );
      
      toast.success("Manual deposit added successfully!");
      setManualDepositOpen(false);
      setManualDepositData({
        customer_id: "",
        amount: "",
        bonus_amount: "",
        payment_method: "manual",
        description: ""
      });
      fetchDeposits(); // Refresh data
    } catch (error) {
      console.error("Manual deposit error:", error);
      toast.error(error.response?.data?.message || "Failed to add manual deposit");
    } finally {
      setIsLoading(false);
    }
  };

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
    const dataToExport = filteredDeposits.map((transaction) => ({
      "Transaction ID": transaction.transaction_id,
      "Date": moment(transaction.createdAt).format("MMM D, YYYY h:mm A"),
      "Payment Method": transaction.payment_method.toUpperCase(),
      "Customer Name": transaction.customer_name,
      "Customer Email": transaction.customer_email,
      "Customer ID": transaction.customer_id,
      "Customer Phone": transaction.customer_phone,
      "Amount": transaction.amount,
      "Bonus Amount": transaction.bonus_amount || 0,
      "Status": transaction.status,
      "Gateway": transaction.gateway || "CredixoPay",
      "Type": transaction.payment_method === "manual" ? "Manual" : "Automatic"
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Deposits");
    XLSX.writeFile(wb, "deposits.xlsx");
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
                <h1 className="text-2xl font-bold text-gray-800">Deposit Transactions</h1>
                <p className="text-gray-500 text-sm mt-1">
                  View and manage all deposit transactions
                </p>
              </div>
            </div>

            {/* Deposit Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Successful Deposits Card */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-100 rounded-full">
                    <FaBangladeshiTakaSign className="text-emerald-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-600">Total Successful Deposits</h3>
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatCurrency(totalSuccessAmount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Automatic deposits only (excluding manual)
                    </p>
                  </div>
                </div>
              </div>

              {/* Manual Deposits Card */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FaBangladeshiTakaSign className="text-blue-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-600">Total Manual Deposits</h3>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatCurrency(totalManualAmount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Manually added deposits by admin
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-wrap gap-3 mb-6 items-end">
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search transactions..."
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
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full p-2 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  <option value="">All Methods</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method.toUpperCase()}
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
                onClick={fetchDeposits}
                className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <FiRefreshCw className={`text-gray-600 ${isLoading ? "animate-spin" : ""}`} />
                <span className="text-sm font-medium">Refresh</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 border border-gray-200 rounded-[5px] text-white transition"
              >
                <FiDownload className="" />
                <span className="text-sm font-medium">Export to Excel</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 text-gray-700">
              <table className="w-full border-collapse bg-white overflow-hidden">
                <thead className="bg-cyan-600 text-white">
                  <tr>
                    <th className="p-4 text-left font-medium">Details</th>
                    <th className="p-4 text-left font-medium">User</th>
                    <th className="p-4 text-left font-medium">Amount</th>
                    <th className="p-4 text-left font-medium">Status</th>
                    <th className="p-4 text-left font-medium">Type</th>
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500 flex justify-center items-center w-full h-full">
                        <div className="flex justify-center">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
                            <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-cyan-500/20 blur-sm"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : currentDeposits.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    currentDeposits.map((transaction, index) => (
                      <React.Fragment key={index}>
                        <tr
                          className={`border-b even:bg-gray-50 hover:bg-gray-100 cursor-pointer ${
                            expandedRow === transaction._id ? "bg-blue-50" : ""
                          }`}
                          onClick={() => toggleRow(transaction._id)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-full ${
                                transaction.payment_method === "manual" ? "bg-green-100" : "bg-blue-100"
                              }`}>
                                <FaBangladeshiTakaSign className={
                                  transaction.payment_method === "manual" ? "text-green-600" : "text-blue-600"
                                } />
                              </div>
                              <div>
                                <div className="font-semibold">
                                  {transaction.transaction_id}
                                </div>
                                <div className="text-gray-500 text-sm">
                                  {moment(transaction.createdAt).format("MMM D, YYYY h:mm A")}
                                </div>
                                <div className="text-gray-500 text-sm">
                                  {transaction.payment_method.toUpperCase()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <FiUser className="text-gray-500" />
                              <div>
                                <div className="font-semibold">
                                  {transaction.customer_name || "N/A"}
                                </div>
                                <div className="text-gray-500 text-sm">
                                  {transaction.customer_email || "N/A"}
                                </div>
                                <div className="text-gray-500 text-sm">
                                  ID: {transaction.customer_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-semibold">
                                  {formatCurrency(transaction.amount)}
                                </div>
                                {transaction.bonus_amount > 0 && (
                                  <div className="text-green-500 text-sm">
                                    +{formatCurrency(transaction.bonus_amount)} bonus
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
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
                          <td className="p-4">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              transaction.payment_method === "manual" 
                                ? "bg-green-100 text-green-800 border-[1px] border-green-400" 
                                : "bg-blue-100 text-blue-800 border-[1px] border-blue-400"
                            }`}>
                              {transaction.payment_method === "manual" ? "Manual" : "Automatic"}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTransaction(transaction);
                                  setStatusPopupOpen(true);
                                }}
                                disabled={transaction.status === "success" || transaction.payment_method === "manual"}
                                className={`px-3 py-1 rounded-md border-[1px] text-sm ${
                                  transaction.status === "success" || transaction.payment_method === "manual"
                                    ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                                    : "bg-amber-50 text-amber-600 border-amber-500 hover:bg-amber-100"
                                }`}
                              >
                                Update
                              </button>
                              <NavLink
                                to={`/deposits/pending-deposit-details/${transaction._id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition text-sm">
                                  <FaRegCommentDots size={12} /> Details
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
                                      <span className="text-gray-500">Transaction ID:</span>
                                      <span>{transaction.transaction_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Type:</span>
                                      <span className="capitalize">
                                        {transaction.payment_method === "manual" ? "Manual Deposit" : "Automatic Deposit"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Method:</span>
                                      <span className="capitalize">
                                        {transaction.payment_method}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Gateway:</span>
                                      <span>{transaction.gateway || "CredixoPay"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Initiated:</span>
                                      <span>
                                        {moment(transaction.createdAt).format(
                                          "MMM D, YYYY h:mm A"
                                        )}
                                      </span>
                                    </div>
                                    {transaction.payment_method === "manual" && transaction.description && (
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
                                      <span className="text-gray-500">Deposit Amount:</span>
                                      <span>{formatCurrency(transaction.amount)}</span>
                                    </div>
                                    {transaction.bonus_amount > 0 && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Bonus:</span>
                                        <span className="text-green-500">
                                          +{formatCurrency(transaction.bonus_amount)}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between border-t pt-2">
                                      <span className="text-gray-500 font-medium">
                                        Total Added:
                                      </span>
                                      <span className="text-green-600 font-medium">
                                        {formatCurrency(transaction.amount + (transaction.bonus_amount || 0))}
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
                                      <span className="text-gray-500">Customer ID:</span>
                                      <span>{transaction.customer_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Name:</span>
                                      <span>{transaction.customer_name || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Email:</span>
                                      <span>{transaction.customer_email || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Phone:</span>
                                      <span>{transaction.customer_phone || "N/A"}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {transaction.gateway_response && (
                                <div className="mt-4 bg-white p-4 rounded-lg shadow">
                                  <h3 className="font-semibold mb-2 text-gray-700">
                                    Gateway Response
                                  </h3>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Payment ID:</span>
                                      <span>{transaction.gateway_response.paymentId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Status:</span>
                                      <span>{transaction.gateway_response.status}</span>
                                    </div>
                                    {transaction.gateway_response.transactionId && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Transaction ID:</span>
                                        <span>{transaction.gateway_response.transactionId}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredDeposits.length > 0 && (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 py-3 border-gray-200 gap-4">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(currentPage * rowsPerPage, filteredDeposits.length)}</span> of{" "}
                  <span className="font-medium">{filteredDeposits.length}</span> results
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

      {/* Status Change Popup */}
      {statusPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Update Transaction Status
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={selectedTransaction?.transaction_id}
                  readOnly
                  className="w-full p-2.5 border border-gray-200 text-gray-700 bg-gray-50 outline-cyan-500 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status
                </label>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    statusConfig[selectedTransaction?.status]?.color || "bg-gray-100 text-gray-600"
                  }`}>
                    {selectedTransaction?.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 text-gray-700 rounded-lg outline-cyan-500 transition"
                >
                  <option value="">Select Status</option>
                  {statusOptions
                    .filter(opt => opt.value !== selectedTransaction?.status)
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Change
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for status change..."
                  className="w-full p-2.5 text-gray-600 border border-gray-200 rounded-lg outline-cyan-500 transition"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setStatusPopupOpen(false);
                  setNewStatus("");
                  setReason("");
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
  
    </div>
  );
};

export default Alldeposit;