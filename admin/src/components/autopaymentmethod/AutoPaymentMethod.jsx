import React, { useState, useEffect } from "react";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import moment from "moment";
import axios from "axios";
import { FiRefreshCw } from "react-icons/fi";
import { MdPayment } from "react-icons/md";
import { BsToggleOn, BsToggleOff } from "react-icons/bs";
import toast, { Toaster } from "react-hot-toast";
import Header from "../common/Header";

const AutoPaymentMethod = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  
  // State for auto payment status
  const [autoPaymentStatus, setAutoPaymentStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  const token = localStorage.getItem("adminToken");

  // Fetch auto payment method status
  const fetchAutoPaymentStatus = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${base_url}/admin/auto-payment-method/status`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.data.success) {
        setAutoPaymentStatus(res.data.data.status);
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch auto payment status");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle auto payment status
  const toggleAutoPaymentStatus = async () => {
    setIsToggling(true);
    try {
      const res = await axios.post(
        `${base_url}/admin/auto-payment-method/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (res.data.success) {
        setAutoPaymentStatus(res.data.data.status);
        toast.success(`Auto payment method ${res.data.data.status ? 'enabled' : 'disabled'} successfully`);
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to toggle auto payment status");
    } finally {
      setIsToggling(false);
    }
  };

  // Update auto payment status directly (enable/disable)
  const updateAutoPaymentStatus = async (newStatus) => {
    setIsToggling(true);
    try {
      const res = await axios.put(
        `${base_url}/admin/auto-payment-method/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (res.data.success) {
        setAutoPaymentStatus(newStatus);
        toast.success(`Auto payment method ${newStatus ? 'enabled' : 'disabled'} successfully`);
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to update auto payment status");
    } finally {
      setIsToggling(false);
    }
  };

  useEffect(() => {
    fetchAutoPaymentStatus();
  }, []);

  // Custom Toggle Switch Component
  const CustomToggle = ({ isOn, onToggle, disabled }) => {
    return (
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex items-center h-16 rounded-full w-32 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300 ${
          isOn ? 'bg-purple-600' : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="sr-only">Toggle auto payment</span>
        <span
          className={`inline-block w-14 h-14 transform transition-transform duration-300 bg-white rounded-full shadow-lg ${
            isOn ? 'translate-x-16' : 'translate-x-1'
          }`}
        />
        <span className={`absolute text-sm font-bold ${
          isOn ? 'left-3 text-white' : 'right-3 text-gray-600'
        }`}>
          {isOn ? 'ON' : 'OFF'}
        </span>
      </button>
    );
  };

  return (
    <div className="w-full font-bai overflow-y-auto min-h-screen bg-gray-50">
      <Header />
      <Toaster position="top-right" />
      
      <section className="md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Auto Payment Method Settings</h1>
            <p className="text-gray-500 text-sm mt-1">
              Enable or disable automatic payment processing for users
            </p>
          </div>

          {/* Main Status Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <MdPayment className="text-white text-2xl" />
                <h2 className="text-white font-semibold text-lg">Auto Payment Status</h2>
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex flex-col items-center justify-center gap-8">
                {/* Status Display with Icon */}
                <div className="text-center">
                  <div className={`inline-block p-6 rounded-full mb-4 ${
                    autoPaymentStatus ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}>
                    {autoPaymentStatus ? (
                      <BsToggleOn className="text-emerald-600 text-7xl" />
                    ) : (
                      <BsToggleOff className="text-amber-600 text-7xl" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <h3 className="text-2xl font-semibold text-gray-800">
                      Auto Payment is
                    </h3>
                    <span className={`px-4 py-2 rounded-full text-base font-bold ${
                      autoPaymentStatus 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {autoPaymentStatus ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    {autoPaymentStatus 
                      ? 'Users can make payments automatically without manual approval. All transactions will be processed instantly.'
                      : 'Auto payment is disabled. All payment requests require manual approval from admin before processing.'
                    }
                  </p>
                </div>

                {/* Centered Toggle Switch */}
                <div className="flex flex-col items-center gap-4">
                  <CustomToggle 
                    isOn={autoPaymentStatus}
                    onToggle={toggleAutoPaymentStatus}
                    disabled={isToggling || isLoading}
                  />
                  
                  {/* Quick Action Buttons */}
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => updateAutoPaymentStatus(true)}
                      disabled={autoPaymentStatus || isToggling || isLoading}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        autoPaymentStatus
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-emerald-500 text-white hover:bg-emerald-600'
                      }`}
                    >
                      Enable
                    </button>
                    <button
                      onClick={() => updateAutoPaymentStatus(false)}
                      disabled={!autoPaymentStatus || isToggling || isLoading}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        !autoPaymentStatus
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-amber-500 text-white hover:bg-amber-600'
                      }`}
                    >
                      Disable
                    </button>
                  </div>
                  
                  {/* Refresh Button */}
                  <button
                    onClick={fetchAutoPaymentStatus}
                    disabled={isLoading}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition mt-2"
                  >
                    <FiRefreshCw className={`text-gray-400 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh status
                  </button>
                </div>

                {/* Loading indicator for toggle action */}
                {isToggling && (
                  <div className="text-sm text-purple-600 animate-pulse">
                    Updating status...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Simple Info Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Note:</span> Toggle the switch above to enable or disable auto payment. 
              When enabled, payments are processed automatically. When disabled, all payments require admin approval.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AutoPaymentMethod;