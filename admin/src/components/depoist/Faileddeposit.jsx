import React, { useState, useEffect } from "react";
import { FaRegCommentDots, FaInfoCircle } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import moment from "moment";
import axios from "axios";
import { FiSearch, FiRefreshCw, FiUser, FiDollarSign, FiClock } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import Header from "../common/Header";

const Faileddeposit = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [deposits, setDeposits] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  // Status Colors and Icons
  const statusConfig = {
    failed: {
      color: "bg-rose-100 text-rose-800",
      icon: <FaInfoCircle className="mr-1" />,
    },
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Fetch failed deposits from API
  const fetchDeposits = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${base_url}/admin/failed-deposit`);
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

  // Toggle row expansion
  const toggleRow = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  const filteredDeposits = deposits.filter((transaction) =>
    Object.values(transaction).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="w-full font-bai overflow-y-auto min-h-screen">
      <Header />
      <Toaster position="top-right" />
      <section className="">
        <div className="overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Failed Deposits</h1>
                <p className="text-gray-500 text-sm mt-1">
                  View all failed deposit transactions
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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
                <button
                  onClick={fetchDeposits}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <FiRefreshCw className={`text-gray-600 ${isLoading ? "animate-spin" : ""}`} />
                  <span className="text-sm font-medium">Refresh</span>
                </button>
              </div>
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
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        <div className="flex justify-center">
                         <div className="relative">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
    <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-cyan-500/20 blur-sm"></div>
  </div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredDeposits.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        No failed transactions found
                      </td>
                    </tr>
                  ) : (
                    filteredDeposits.map((transaction, index) => (
                      <React.Fragment key={index}>
                        <tr
                          className={`border-b even:bg-gray-50 hover:bg-gray-100 cursor-pointer ${
                            expandedRow === transaction._id ? "bg-blue-50" : ""
                          }`}
                          onClick={() => toggleRow(transaction._id)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-blue-100 rounded-full">
                                <FiDollarSign className="text-blue-600" />
                              </div>
                              <div>
                                <div className="font-semibold">
                                  {transaction.transaction_id || transaction.transactionId}
                                </div>
                                <div className="text-gray-500 text-sm">
                                  {moment(transaction.createdAt).format("MMM D, YYYY h:mm A")}
                                </div>
                                <div className="text-gray-500 text-sm">
                                  {transaction.payment_method?.toUpperCase() || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <FiUser className="text-gray-500" />
                              <div>
                                <div className="font-semibold">
                                  {transaction.customer_name}
                                </div>
                                <div className="text-gray-500 text-sm">
                                  {transaction.customer_email}
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
                                statusConfig.failed.color
                              }`}
                            >
                              {statusConfig.failed.icon}
                              Failed
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
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
                            <td colSpan="5" className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow">
                                  <h3 className="font-semibold mb-2 text-gray-700">
                                    Transaction Details
                                  </h3>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Transaction ID:</span>
                                      <span>{transaction.transaction_id || transaction.transactionId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Gateway:</span>
                                      <span>{transaction.gateway || "Easypay"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Method:</span>
                                      <span className="capitalize">
                                        {transaction.payment_method || "N/A"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Initiated:</span>
                                      <span>
                                        {moment(transaction.createdAt).format(
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
                                        Total Would Have Added:
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
                                      <span>{transaction.customer_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Email:</span>
                                      <span>{transaction.customer_email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Phone:</span>
                                      <span>{transaction.customer_phone}</span>
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
                                    {transaction.gateway_response.message && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Message:</span>
                                        <span>{transaction.gateway_response.message}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {transaction.reason && (
                                <div className="mt-4 bg-white p-4 rounded-lg shadow">
                                  <h3 className="font-semibold mb-2 text-gray-700">
                                    Failure Reason
                                  </h3>
                                  <p className="text-gray-700">{transaction.reason}</p>
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

            {/* Pagination */}
            {filteredDeposits.length > 0 && (
              <div className="flex justify-between items-center mt-4 px-4 py-3 bg-gray-50 border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">{filteredDeposits.length}</span> of{" "}
                  <span className="font-medium">{filteredDeposits.length}</span> results
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Faileddeposit;