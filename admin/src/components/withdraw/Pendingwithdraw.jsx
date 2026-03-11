import React, { useState, useEffect } from "react";
import { FaRegCommentDots, FaMoneyBillWave, FaInfoCircle } from "react-icons/fa";
import { FiSearch, FiClock, FiUser, FiDollarSign } from "react-icons/fi";
import { MdPayment, MdCancel, MdCheckCircle } from "react-icons/md";
import { NavLink } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import Header from "../common/Header";
import { nanoid } from "nanoid";
import toast, { Toaster } from "react-hot-toast";

const Pendingwithdraw = () => {
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState("");
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const base_url2 = import.meta.env.VITE_API_KEY_Base_URL2;

  // Fetch Pending Withdrawals
  const fetchWithdrawals = () => {
    setLoading(true);
    axios
      .get(`${base_url}/admin/pending-withdrawal`)
      .then((res) => {
        setPendingWithdrawals(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to fetch pending withdrawals");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWithdrawals();
    setOrderId(nanoid(8));
  }, []);

  // Toggle row expansion
  const toggleRow = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  // Handle Status Change
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

  // Filter Withdrawals Based on Search Query
  const filteredWithdrawals = pendingWithdrawals.filter((transaction) =>
    Object.values(transaction).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full font-bai overflow-y-auto">
      <Header />
      <Toaster />
      <section className="">
        <div className="">
          <div className="w-full p-4 bg-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Pending Withdrawals</h1>
                <p className="text-gray-500">
                  {pendingWithdrawals.length} pending withdrawals
                </p>
              </div>

              <div className="relative w-full md:w-[40%]">
                <input
                  type="text"
                  placeholder="Search by user, gateway, amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {loading ? (
         <div className="flex justify-center">
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
                      <th className="p-3 text-left">Tax/Fee</th>
                      <th className="p-3 text-left">Net Amount</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWithdrawals.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-4 text-center text-gray-500">
                          No pending withdrawals found
                        </td>
                      </tr>
                    ) : (
                      filteredWithdrawals.map((transaction, index) => (
                        <React.Fragment key={index}>
                          <tr
                            className={`border-b even:bg-gray-50 hover:bg-gray-100 cursor-pointer ${
                              expandedRow === transaction._id ? "bg-blue-50" : ""
                            }`}
                            onClick={() => toggleRow(transaction._id)}
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 rounded-full">
                                  <MdPayment className="text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-semibold">
                                    {transaction.provider.toUpperCase()}
                                  </div>
                                  <div className="text-gray-500 text-sm">
                                    {moment(transaction.createdAt).format("MMM D, YYYY h:mm A")}
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
                            <td className="p-3 font-semibold">
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td className="p-3 text-red-500 font-semibold">
                              -{formatCurrency(transaction.tax_amount)}
                            </td>
                            <td className="p-3 text-green-600 font-semibold">
                              {formatCurrency(transaction.recieved_amount)}
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
                                    transaction.status === "rejected"
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
                              <td colSpan="7" className="p-4">
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
                                        <span className="text-gray-500">Gateway:</span>
                                        <span className="capitalize">
                                          {transaction.provider}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Account:</span>
                                        <span>{transaction.payeeAccount}</span>
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
                                        <span className="text-gray-500">Requested:</span>
                                        <span>{formatCurrency(transaction.amount)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Tax/Fee:</span>
                                        <span className="text-red-500">
                                          -{formatCurrency(transaction.tax_amount)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Post Balance:</span>
                                        <span>{formatCurrency(transaction.post_balance)}</span>
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
                                        <span className="text-gray-500">Deposit Amount:</span>
                                        <span>{formatCurrency(transaction.deposit_money)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Bet Amount:</span>
                                        <span>{formatCurrency(transaction.bet_deposit)}</span>
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pendingwithdraw;