import React, { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaInfoCircle, FaMoneyBillWave, FaUser, FaPhone, FaEnvelope, FaIdCard, FaLink } from "react-icons/fa";
import Header from "../../common/Header";
import axios from "axios";
import { useParams } from "react-router-dom";
import moment from "moment";

const DepositRequest = () => {
  const [depositDetails, setDepositDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const fetchDepositInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${base_url}/admin/single-deposit/${id}`);
      setDepositDetails(res.data.data);
    } catch (err) {
      console.error("Error fetching deposit details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepositInfo();
  }, []);

  if (loading) return (
    <section className="w-full bg-gray-1 font-bai">
      <Header />
      <div className="p-6 w-full flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-500">Loading deposit details...</div>
      </div>
    </section>
  );

  if (!depositDetails) return (
    <section className="w-full bg-gray-1 font-bai">
      <Header />
      <div className="p-6 w-full flex justify-center items-center h-64">
        <div className="text-red-500">Failed to load deposit details</div>
      </div>
    </section>
  );

  const statusColors = {
    pending: { text: "text-orange-600", bg: "bg-orange-100" },
    approved: { text: "text-green-600", bg: "bg-green-100" },
    rejected: { text: "text-red-600", bg: "bg-red-100" }
  };

  return (
    <section className="w-full bg-gray-1 font-bai">
      <Header />
      <div className="p-6 w-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
            Deposit Request: {depositDetails.customer_name}
          </h2>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold`}>
            {depositDetails.status.toUpperCase()}
          </span>
        </div>

        <div className="flex gap-6 w-full flex-col lg:flex-row">
          {/* Left Panel - Transaction Details */}
          <div className="bg-white w-full lg:w-[40%] shadow-sm rounded-[5px] border border-green-400  p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
              <FaInfoCircle className="mr-2" />
              Transaction Details
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-3">
                <span className="font-medium text-gray-700">Transaction ID:</span>
                <span className="text-gray-900 font-mono">{depositDetails.transaction_id}</span>
              </div>
              
              <div className="flex justify-between border-b pb-3">
                <span className="font-medium text-gray-700">Date:</span>
                <span className="text-gray-900">
                  {moment(depositDetails.createdAt.$date).format("MMMM Do YYYY, h:mm A")}
                </span>
              </div>
              
              <div className="flex justify-between border-b pb-3">
                <span className="font-medium text-gray-700">Payment Method:</span>
                <span className="text-gray-900 font-semibold">{depositDetails.payment_method}</span>
              </div>
              
              <div className="flex justify-between border-b pb-3">
                <span className="font-medium text-gray-700">Amount:</span>
                <span className="text-gray-900 font-bold">৳{depositDetails.amount.toFixed(2)} BDT</span>
              </div>
              
              {depositDetails.bonus_amount > 0 && (
                <div className="flex justify-between border-b pb-3">
                  <span className="font-medium text-gray-700">Bonus Amount:</span>
                  <span className="text-green-600 font-semibold">+৳{depositDetails.bonus_amount.toFixed(2)} BDT</span>
                </div>
              )}
              
              <div className="flex justify-between border-b pb-3">
                <span className="font-medium text-gray-700">Post Balance:</span>
                <span className="text-gray-900">৳{depositDetails.post_balance.toFixed(2)} BDT</span>
              </div>
              
              <div className="flex justify-between border-b pb-3">
                <span className="font-medium text-gray-700">Bonus Type:</span>
                <span className="text-gray-900 capitalize">{depositDetails.bonus_type || "N/A"}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Updated By:</span>
                <span className="text-gray-900">{depositDetails.updated_by}</span>
              </div>
            </div>
          </div>

          {/* Middle Panel - User Information */}
          <div className="bg-white w-full lg:w-[30%] shadow-sm rounded-lg border border-orange-500 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
              <FaUser className="mr-2" />
              User Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center border-b pb-3">
                <FaIdCard className="text-gray-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-700">Customer ID</p>
                  <p className="text-gray-900 text-sm font-mono">{depositDetails.customer_id}</p>
                </div>
              </div>
              
              <div className="flex items-center border-b pb-3">
                <FaUser className="text-gray-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-700">Name</p>
                  <p className="text-gray-900">{depositDetails.customer_name}</p>
                </div>
              </div>
              
              <div className="flex items-center border-b pb-3">
                <FaEnvelope className="text-gray-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-700">Email</p>
                  <p className="text-gray-900">{depositDetails.customer_email}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaPhone className="text-gray-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-700">Phone</p>
                  <p className="text-gray-900">{depositDetails.customer_phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Additional Information */}
          <div className="bg-white w-full lg:w-[30%] shadow-sm rounded-lg border border-yellow-600 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
              <FaInfoCircle className="mr-2" />
              Additional Information
            </h3>
            
            <div className="space-y-4">
              {depositDetails.gateway_response && (
                <>
                  <div className="border-b pb-3">
                    <p className="font-medium text-gray-700 mb-1">Gateway Response</p>
                    <p className={`text-sm ${depositDetails.gateway_response.success ? 'text-green-600' : 'text-red-600'}`}>
                      {depositDetails.gateway_response.message}
                    </p>
                  </div>
                  
                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-gray-700">Order ID:</span>
                    <span className="text-gray-900 text-sm font-mono">{depositDetails.gateway_response.orderId}</span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-gray-700">Payment ID:</span>
                    <span className="text-gray-900 text-sm font-mono">{depositDetails.gateway_response.paymentId}</span>
                  </div>
                  
                  <div className="border-b pb-3">
                    <p className="font-medium text-gray-700 mb-1">Payment Link</p>
                    <a 
                      href={depositDetails.gateway_response.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm flex items-center hover:underline"
                    >
                      <FaLink className="mr-1" /> {depositDetails.gateway_response.link}
                    </a>
                  </div>
                </>
              )}
              
              <div>
                <p className="font-medium text-gray-700 mb-1">Transaction Note</p>
                <p className="text-gray-900 text-sm">{depositDetails.transaction_note}</p>
              </div>
              
              {depositDetails.reason && (
                <div>
                  <p className="font-medium text-gray-700 mb-1">Reason</p>
                  <p className="text-gray-900 text-sm">{depositDetails.reason}</p>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Last Updated:</span>
                <span className="text-gray-900 text-sm">
                  {moment(depositDetails.updatedAt.$date).format("MMMM Do YYYY, h:mm A")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {depositDetails.status === "pending" && (
          <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-[#eee] flex justify-end space-x-4">
            <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center">
              <FaTimes className="mr-2" /> Reject
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center">
              <FaCheck className="mr-2" /> Approve
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default DepositRequest;