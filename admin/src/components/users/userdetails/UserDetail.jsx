import { FaWallet, FaExchangeAlt, FaMoneyBillAlt, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity, FaGlobe, FaMapPin, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { BsBank } from "react-icons/bs";
import Header from "../../common/Header";
import { FaBalanceScale, FaSignInAlt, FaBell, FaUserSlash, FaGift, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { FiMinusCircle } from "react-icons/fi";
import { RiLoginCircleLine } from "react-icons/ri";
import { IoBanSharp } from "react-icons/io5";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AddBalanceModal from "./AddBalanceModal";
import { NavLink } from "react-router-dom";
import SubtractBalanceModal from "./SubtractBalanceModal";
import BanUserModal from "./BanUserModal";
import { LuGamepad } from "react-icons/lu";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { GiCash } from "react-icons/gi";
import { TbPasswordUser } from "react-icons/tb";
import { MdEmail, MdVerifiedUser, MdPhoneIphone } from "react-icons/md";
import WithdrawalBanModal from "./WithdrawalBanModal";
import { FaEye, FaCopy, FaExternalLinkAlt, FaInfoCircle, FaDatabase } from "react-icons/fa";
// Level icons
import bronzeImg from '../../../assets/level/silver.png';
import silverImg from '../../../assets/level/silver.png';
import goldImg from '../../../assets/level/medal.png';
import platinumImg from '../../../assets/level/platinum.png';
import diamondImg from '../../../assets/level/diamond.png';

const levels = [
  { name: 'Bronze', threshold: 0, icon: bronzeImg, color: 'from-amber-700 to-amber-900', progressColor: 'bg-amber-500', bgColor: 'bg-amber-800' },
  { name: 'Silver', threshold: 10000, icon: silverImg, color: 'from-gray-400 to-gray-600', progressColor: 'bg-gray-300', bgColor: 'bg-gray-600' },
  { name: 'Gold', threshold: 30000, icon: goldImg, color: 'from-yellow-500 to-yellow-700', progressColor: 'bg-yellow-400', bgColor: 'bg-yellow-700' },
  { name: 'Platinum', threshold: 100000, icon: platinumImg, color: 'from-cyan-400 to-cyan-600', progressColor: 'bg-cyan-300', bgColor: 'bg-cyan-700' },
  { name: 'Diamond', threshold: 500000, icon: diamondImg, color: 'from-blue-500 to-purple-600', progressColor: 'bg-gradient-to-r from-blue-400 to-purple-500', bgColor: 'bg-gradient-to-r from-blue-600 to-purple-700' }
];

/* -------------------------------------------------------------------------- */
/* Weekly/Monthly Bonus Table Section */
/* -------------------------------------------------------------------------- */
const WeeklyMonthlyBonusSection = ({ userDetail }) => {
  const [showAllBonuses, setShowAllBonuses] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const getBonusStatusBadge = (status) => {
    const base = "text-xs px-2.5 py-1 rounded-full font-medium";
    switch (status?.toLowerCase()) {
      case "claimed":
        return <span className={`${base} bg-green-100 text-green-800 border-[1px] border-green-500`}>Claimed</span>;
      case "unclaimed":
        return <span className={`${base} bg-yellow-100 text-yellow-800 border-[1px] border-yellow-500`}>Unclaimed</span>;
      case "expired":
        return <span className={`${base} bg-red-100 text-red-800 border-[1px] border-red-500`}>Expired</span>;
      case "pending":
        return <span className={`${base} bg-blue-100 text-blue-800 border-[1px] border-blue-500`}>Pending</span>;
      case "available":
        return <span className={`${base} bg-purple-100 text-purple-800 border-[1px] border-purple-500`}>Available</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-800 border-[1px] border-gray-500`}>{status || 'N/A'}</span>;
    }
  };

  const calculateBonusExpiryStatus = (bonus) => {
    if (bonus.status === 'claimed') {
      return { status: 'claimed', isExpired: false };
    }
    
    if (bonus.status === 'unclaimed' && bonus.claimedAt) {
      const claimedDate = new Date(bonus.claimedAt);
      const now = new Date();
      const hoursDiff = Math.abs(now - claimedDate) / 36e5;
      
      if (hoursDiff > 48) {
        return { status: 'expired', isExpired: true };
      }
    }
    
    return { status: bonus.status || 'unclaimed', isExpired: false };
  };

  // Get weekly and monthly bonuses from userDetail.bonusHistory
  const weeklyBonuses = userDetail.bonusHistory?.filter(bonus => bonus.type === 'weekly') || [];
  const monthlyBonuses = userDetail.bonusHistory?.filter(bonus => bonus.type === 'monthly') || [];

  // Get current weekly and monthly bonus status from userDetail.weeklyBonus and userDetail.monthlyBonus
  const currentWeeklyBonus = userDetail.weeklyBonus || {};
  const currentMonthlyBonus = userDetail.monthlyBonus || {};

  // Combine all bonuses for display
  const allBonuses = [
    ...weeklyBonuses.map(b => ({ ...b, bonusType: 'Weekly Bonus' })),
    ...monthlyBonuses.map(b => ({ ...b, bonusType: 'Monthly Bonus' }))
  ].sort((a, b) => new Date(b.claimedAt || b.createdAt || 0) - new Date(a.claimedAt || a.createdAt || 0));

  const displayedBonuses = showAllBonuses ? allBonuses : allBonuses.slice(0, 5);

  // Calculate totals
  const totalWeeklyBonus = weeklyBonuses.reduce((sum, bonus) => sum + (bonus.amount || 0), 0);
  const totalMonthlyBonus = monthlyBonuses.reduce((sum, bonus) => sum + (bonus.amount || 0), 0);
  const claimedWeekly = weeklyBonuses.filter(b => b.status === 'claimed').length;
  const claimedMonthly = monthlyBonuses.filter(b => b.status === 'claimed').length;

  return (
    <div className="bg-white p-6 rounded-[5px] shadow-md border border-teal-300">
      <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <FaGift className="mr-2 text-teal-500" /> Weekly & Monthly Bonuses
        </div>
        <button
          onClick={() => setShowAllBonuses(!showAllBonuses)}
          className="text-blue-500 hover:text-blue-700"
        >
          {showAllBonuses ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </h3>


      {/* Bonus Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
          <p className="text-sm text-gray-600">Total Weekly Bonus</p>
          <p className="font-semibold text-lg text-teal-700">৳{totalWeeklyBonus.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">{weeklyBonuses.length} bonuses</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">Total Monthly Bonus</p>
          <p className="font-semibold text-lg text-blue-700">৳{totalMonthlyBonus.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">{monthlyBonuses.length} bonuses</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Claimed Weekly</p>
          <p className="font-semibold text-lg text-green-700">{claimedWeekly}</p>
          <p className="text-xs text-gray-500 mt-1">of {weeklyBonuses.length}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600">Claimed Monthly</p>
          <p className="font-semibold text-lg text-purple-700">{claimedMonthly}</p>
          <p className="text-xs text-gray-500 mt-1">of {monthlyBonuses.length}</p>
        </div>
      </div>

      {/* Bonus History Table */}
      {allBonuses.length > 0 ? (
        <>
          <h4 className="font-semibold mb-3 text-lg">Bonus History</h4>
          <div className="overflow-x-auto border-[1px] border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Bonus Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Bonus Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Total Bet</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Claimed At</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Expiry Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedBonuses.map((bonus, index) => {
                  const expiryStatus = calculateBonusExpiryStatus(bonus);
                  return (
                    <tr key={bonus._id?.$oid || index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center">
                          {bonus.bonusType === 'Weekly Bonus' ? (
                            <FaCalendarAlt className="mr-2 text-teal-500" />
                          ) : (
                            <FaCalendarAlt className="mr-2 text-blue-500" />
                          )}
                          {bonus.bonusType}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-600 font-semibold">
                          ৳{bonus.amount?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        ৳{bonus.totalBet?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {bonus.claimedAt ? formatDate(bonus.claimedAt) : 'Not Claimed'}
                      </td>
                      <td className="px-4 py-3">
                        {getBonusStatusBadge(bonus.status)}
                      </td>
                      <td className="px-4 py-3">
                        {expiryStatus.isExpired ? (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Expired</span>
                        ) : (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Valid</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {allBonuses.length > 5 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllBonuses(!showAllBonuses)}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                {showAllBonuses ? 'Show Less' : `Show All (${allBonuses.length} bonuses)`}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No weekly or monthly bonus history available
        </div>
      )}

      {/* Pending Bonuses from Transaction History */}
      {userDetail.transactionHistory?.some(t => t.type === 'bonus_pending') && (
        <div className="mt-6">
          <h4 className="font-semibold mb-3 text-lg">Pending Bonus Distribution</h4>
          <div className="overflow-x-auto border-[1px] border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-yellow-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Reference ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Description</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {userDetail.transactionHistory
                  .filter(t => t.type === 'bonus_pending')
                  .map((transaction, index) => (
                    <tr key={transaction._id?.$oid || index} className="border-b hover:bg-yellow-50">
                      <td className="px-4 py-3 font-medium text-xs">
                        {transaction.referenceId}
                      </td>
                      <td className="px-4 py-3">
                        {transaction.referenceId?.includes('WEEKLY') ? 'Weekly Bonus' : 'Monthly Bonus'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-yellow-600 font-semibold">
                          ৳{transaction.amount?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {transaction.description}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* KYC Status Modal */
/* -------------------------------------------------------------------------- */
const KYCStatusModal = ({ isOpen, onClose, userId, currentKYCStatus, refreshData }) => {
  const [kycSubmitted, setKycSubmitted] = useState(currentKYCStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await axios.put(
        `${base_url}/admin/kyc/${userId}/submit-status`,
        {
          kycSubmitted: kycSubmitted
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
          }
        }
      );
      
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: response.data.message || 'KYC submission status updated successfully'
        });
        
        setTimeout(() => {
          refreshData();
          onClose();
        }, 1500);
      } else {
        setMessage({
          type: 'error',
          text: response.data.message || 'Failed to update KYC status'
        });
      }
    } catch (error) {
      console.error("Error updating KYC status:", error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update KYC submission status'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setKycSubmitted(currentKYCStatus);
    setMessage({ type: '', text: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Update KYC Submission Status</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {message.text && (
          <div
            className={`p-3 rounded mb-4 ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              KYC Submission Status
            </label>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="kyc-true"
                  name="kycStatus"
                  checked={kycSubmitted === true}
                  onChange={() => setKycSubmitted(true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  disabled={loading}
                />
                <label htmlFor="kyc-true" className="ml-3 flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span className="text-gray-700">Submitted (True)</span>
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="kyc-false"
                  name="kycStatus"
                  checked={kycSubmitted === false}
                  onChange={() => setKycSubmitted(false)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  disabled={loading}
                />
                <label htmlFor="kyc-false" className="ml-3 flex items-center">
                  <FaUserSlash className="text-red-500 mr-2" />
                  <span className="text-gray-700">Not Submitted (False)</span>
                </label>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Setting to "Not Submitted" will also set KYC Completed to false.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Update KYC Status'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* KYC History Section */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* KYC Verification Details Modal */
/* -------------------------------------------------------------------------- */
const KYCVerificationDetailsModal = ({ isOpen, onClose, verification }) => {
  if (!isOpen || !verification) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const parseMetadata = (metadata) => {
    if (!metadata) return {};
    try {
      return typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
    } catch (e) {
      return {};
    }
  };

  const metadata = parseMetadata(verification.metadata);
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Approved</span>;
      case "pending":
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Pending</span>;
      case "rejected":
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Rejected</span>;
      case "completed":
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Completed</span>;
      case "not started":
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Not Started</span>;
      case "in progress":
        return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">In Progress</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">{status || 'N/A'}</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-indigo-50">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">KYC Verification Details</h3>
            <p className="text-sm text-gray-600 mt-1">
              Session ID: <span className="font-mono text-indigo-700">{verification.sessionId}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Information */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
                  <FaInfoCircle className="inline mr-2 text-blue-500" />
                  Session Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Session ID</p>
                    <p className="font-mono text-sm text-gray-800 break-all">{verification.sessionId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Workflow ID</p>
                    <p className="font-mono text-sm text-gray-800 break-all">{verification.workflowId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Session Token</p>
                    <p className="font-mono text-sm text-gray-800 break-all">{verification.sessionToken}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Status</p>
                    <div className="mt-1">{getStatusBadge(verification.status)}</div>
                  </div>
                </div>
              </div>

              {/* Verification Links */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-blue-300">
                  <FaExternalLinkAlt className="inline mr-2 text-blue-500" />
                  Verification Links
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">Verification URL</p>
                    {verification.verificationUrl ? (
                      <a
                        href={verification.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline text-sm bg-white px-3 py-2 rounded border border-blue-200"
                      >
                        <FaExternalLinkAlt className="mr-2" />
                        Open Verification Portal
                      </a>
                    ) : (
                      <p className="text-gray-500 text-sm">Not available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps & Metadata */}
            <div className="space-y-4">
              {/* Timestamps */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
                  <FaCalendarAlt className="inline mr-2 text-green-500" />
                  Timestamps
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Created At</p>
                    <p className="text-sm text-gray-800">{formatDate(verification.createdAt)}</p>
                  </div>
                  {verification.updatedAt && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Last Updated</p>
                      <p className="text-sm text-gray-800">{formatDate(verification.updatedAt)}</p>
                    </div>
                  )}
                  {verification.completedAt && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Completed At</p>
                      <p className="text-sm text-gray-800">{formatDate(verification.completedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-purple-300">
                  <FaDatabase className="inline mr-2 text-purple-500" />
                  Metadata
                </h4>
                <div className="space-y-3">
                  {Object.keys(metadata).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(metadata).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs text-gray-500 font-medium capitalize">
                            {key.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-gray-800 break-all">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No metadata available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Session Status:</span>
                {getStatusBadge(verification.status)}
              </div>
              <div className="flex space-x-3">
                {verification.verificationUrl && (
                  <a
                    href={verification.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <FaExternalLinkAlt className="mr-2" />
                    Open Verification
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* KYC History Section */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* KYC History Section */
/* -------------------------------------------------------------------------- */
const KYCHistorySection = ({ userDetail }) => {
  const [showAllDocuments, setShowAllDocuments] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Approved</span>;
      case "pending":
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Pending</span>;
      case "rejected":
      case "declined":
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Rejected</span>;
      case "completed":
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Completed</span>;
      case "not started":
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Not Started</span>;
      case "in progress":
        return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">In Progress</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">{status || 'N/A'}</span>;
    }
  };

  const getDocumentTypeName = (type) => {
    const typeMap = {
      "voter_id": "Voter ID",
      "passport": "Passport",
      "driving_license": "Driving License",
      "national_id": "National ID",
      "birth_certificate": "Birth Certificate"
    };
    return typeMap[type] || type?.replace(/_/g, ' ').toUpperCase();
  };

  // Calculate total rejection count
  const rejectionCount = [
    ...(userDetail.kycRejections || []),
    ...(userDetail.kycDocuments?.filter(doc => 
      doc.status?.toLowerCase() === 'rejected' || doc.status=== 'Declined'
    ) || [])
  ].length;

  // Check if user has been rejected 3 or more times
  const hasMultipleRejections = rejectionCount >= 3;

  // Sort documents by submission date (newest first)
  const sortedDocuments = [...(userDetail.kycDocuments || [])].sort((a, b) => 
    new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)
  );

  // Sort verifications by creation date (newest first)
  const sortedVerifications = [...(userDetail.kycVerifications || [])].sort((a, b) => 
    new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  // Get KYC notes (rejections and submissions)
  const kycNotes = userDetail.notes?.filter(note => 
    note.note.includes("KYC") || note.createdBy === "admin"
  ) || [];

  // Get KYC rejections with timestamps
  const kycRejections = [
    ...(userDetail.kycRejections || []),
    ...(userDetail.kycDocuments?.filter(doc => 
      doc.status?.toLowerCase() === 'rejected' || doc.status?.toLowerCase() === 'declined'
    ).map(doc => ({
      _id: doc._id,
      rejectedAt: doc.rejectedAt || doc.updatedAt || doc.submittedAt,
      reason: doc.rejectionReason || doc.reason || 'No reason provided',
      previousStatus: doc.previousStatus || doc.status,
      documentType: doc.documentType
    })) || [])
  ].sort((a, b) => new Date(b.rejectedAt || 0) - new Date(a.rejectedAt || 0));

  // Get KYC submission history
  const kycSubmissionHistory = userDetail.kycSubmissionHistory || [];

  const handleViewDetails = (verification) => {
    setSelectedVerification(verification);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVerification(null);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-[5px] shadow-md border border-indigo-300">
        <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <FaCheckCircle className="mr-2 text-indigo-500" /> KYC History & Documents
          </div>
          <button
            onClick={() => setShowAllDocuments(!showAllDocuments)}
            className="text-blue-500 hover:text-blue-700"
          >
            {showAllDocuments ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </h3>

        {/* Multiple Rejections Warning Marquee */}
        {hasMultipleRejections && (
          <div className="mb-6 overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-lg shadow-lg animate-pulse">
            <div className="relative flex items-center">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-white"></div>
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white"></div>
              <div className="flex-1 overflow-hidden">
                <div className="whitespace-nowrap animate-marquee py-3">
                  <span className="inline-flex items-center mx-4">
                    <span className="bg-white text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg mr-3 shadow-lg">
                      ⚠️
                    </span>
                    <span className="text-white font-bold text-xl tracking-wider">
                      USER HAS BEEN REJECTED {rejectionCount} TIMES! 
                    </span>
                    <span className="mx-4 text-yellow-300 font-bold text-2xl">•</span>
                    <span className="text-white font-semibold text-lg">
                      Multiple KYC Rejection Attempts Detected
                    </span>
                    <span className="mx-4 text-yellow-300 font-bold text-2xl">•</span>
                    <span className="bg-yellow-400 text-red-700 px-4 py-1 rounded-full font-bold text-lg shadow-inner">
                      ACTION REQUIRED
                    </span>
                    <span className="mx-4 text-yellow-300 font-bold text-2xl">•</span>
                    <span className="text-white font-bold text-lg">
                      Total Rejections: {rejectionCount}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KYC Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">KYC Status</p>
            <p className={`font-semibold text-lg ${userDetail.kycCompleted ? 'text-green-600' : userDetail.kycStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
              {userDetail.kycCompleted ? 'Completed' : userDetail.kycStatus?.charAt(0).toUpperCase() + userDetail.kycStatus?.slice(1) || 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Verification Sessions</p>
            <p className="font-semibold text-lg">{sortedVerifications.length}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Documents Submitted</p>
            <p className="font-semibold text-lg">{sortedDocuments.length}</p>
          </div>
        </div>

        {/* KYC Verification History Table */}
        {sortedVerifications.length > 0 && (
          <>
            <h4 className="font-semibold mb-3 text-lg">KYC Verification History</h4>
            <div className="overflow-x-auto border-[1px] border-gray-200 rounded-lg mb-6">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Session ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Workflow ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Verification URL</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Created At</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedVerifications.map((verification, index) => (
                    <tr key={verification._id || verification.sessionId || index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-xs text-gray-800">
                          {verification.sessionId?.substring(0, 12)}...
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600">
                          {verification.workflowId?.substring(0, 12)}...
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(verification.status)}
                      </td>
                      <td className="px-4 py-3">
                        {verification.verificationUrl ? (
                          <a 
                            href={verification.verificationUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline text-xs"
                          >
                            Open Link
                          </a>
                        ) : (
                          <span className="text-gray-500 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {verification.createdAt ? formatDate(verification.createdAt) : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewDetails(verification)}
                          className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors flex items-center gap-1"
                        >
                          <FaEye className="text-xs" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Verification Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">Latest Session</p>
                <p className="font-medium text-sm">
                  {sortedVerifications[0]?.createdAt ? formatDate(sortedVerifications[0].createdAt) : 'N/A'}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="font-semibold text-lg text-green-700">
                  {sortedVerifications.filter(v => v.status?.toLowerCase() === 'completed').length}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="font-semibold text-lg text-yellow-700">
                  {sortedVerifications.filter(v => v.status?.toLowerCase() === 'in progress').length}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-sm text-gray-600">Rejected/Declined</p>
                <p className="font-semibold text-lg text-red-700">
                  {sortedVerifications.filter(v => 
                    v.status?.toLowerCase() === 'rejected' || v.status?.toLowerCase() === 'declined'
                  ).length}
                </p>
              </div>
            </div>
          </>
        )}

        {/* KYC Documents Table */}
        {sortedDocuments.length > 0 && (
          <>
            <h4 className="font-semibold mb-3 text-lg">KYC Documents</h4>
            <div className="overflow-x-auto border-[1px] border-gray-200 rounded-lg mb-6">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Document Type</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Front Image</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Back Image</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Submitted At</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Rejection Time</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDocuments.map((doc, index) => {
                    const isRejected = doc.status?.toLowerCase() === 'rejected' || doc.status?.toLowerCase() === 'declined';
                    const rejectionTime = isRejected ? (doc.rejectedAt || doc.updatedAt || doc.submittedAt) : null;
                    
                    return (
                      <tr key={doc._id || index} className={`border-b hover:bg-gray-50 ${isRejected ? 'bg-red-50' : ''}`}>
                        <td className="px-4 py-3 font-medium">
                          {getDocumentTypeName(doc.documentType)}
                        </td>
                        <td className="px-4 py-3">
                          {doc.frontImage ? (
                            <a 
                              href={`${import.meta.env.VITE_API_KEY_Base_URL}${doc.frontImage}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              View Front
                            </a>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {doc.backImage ? (
                            <a 
                              href={`${import.meta.env.VITE_API_KEY_Base_URL}${doc.backImage}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              View Back
                            </a>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(doc.status)}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {doc.submittedAt ? formatDate(doc.submittedAt) : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {rejectionTime ? formatDate(rejectionTime) : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {isRejected ? (
                            <span className="text-red-600 font-medium">
                              {doc.rejectionReason || doc.reason || 'No reason provided'}
                            </span>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* KYC Submission History */}
        {kycSubmissionHistory.length > 0 && (
          <>
            <h4 className="font-semibold mb-3 text-lg">KYC Submission History</h4>
            <div className="overflow-x-auto border-[1px] border-gray-200 rounded-lg mb-6">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Submission Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Documents Count</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Reviewed By</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Rejection Time</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {kycSubmissionHistory.map((submission, index) => {
                    const isRejected = submission.status?.toLowerCase() === 'rejected' || submission.status?.toLowerCase() === 'declined';
                    
                    return (
                      <tr key={submission._id || index} className={`border-b hover:bg-gray-50 ${isRejected ? 'bg-red-50' : ''}`}>
                        <td className="px-4 py-3">
                          {submission.submittedAt ? formatDate(submission.submittedAt) : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(submission.status)}
                        </td>
                        <td className="px-4 py-3">
                          {submission.documentsCount || 0}
                        </td>
                        <td className="px-4 py-3">
                          {submission.reviewedBy || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {isRejected && submission.rejectedAt ? formatDate(submission.rejectedAt) : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {isRejected ? (
                            <span className="text-red-600 font-medium">
                              {submission.rejectionReason || 'No reason provided'}
                            </span>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* KYC Rejection History */}
        {kycRejections.length > 0 && (
          <>
            <h4 className="font-semibold mb-3 text-lg">KYC Rejection History</h4>
            <div className="overflow-x-auto border-[1px] border-gray-200 rounded-lg mb-6">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Document Type</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Rejected At</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Rejected By</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Reason</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Previous Status</th>
                  </tr>
                </thead>
                <tbody>
                  {kycRejections.map((rejection, index) => (
                    <tr key={rejection._id || index} className="border-b hover:bg-red-50">
                      <td className="px-4 py-3 font-medium">
                        {rejection.documentType ? getDocumentTypeName(rejection.documentType) : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        {rejection.rejectedAt ? formatDate(rejection.rejectedAt) : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        Admin
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-red-600 font-medium">
                          {rejection.reason || 'No reason provided'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(rejection.previousStatus)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* KYC Activity Log */}
        {kycNotes.length > 0 && (
          <>
            <h4 className="font-semibold mb-3 text-lg">KYC Activity Log</h4>
            <div className="space-y-4">
              {kycNotes.map((note, index) => {
                const isRejection = note.note.toLowerCase().includes('reject') || 
                                   note.note.toLowerCase().includes('declin');
                
                return (
                  <div key={note._id || index} className={`border-l-4 ${isRejection ? 'border-red-500' : 'border-indigo-500'} bg-gray-50 p-4 rounded-r-lg`}>
                    <div className="flex justify-between items-start mb-2">
                      <p className={`font-medium ${isRejection ? 'text-red-800' : 'text-gray-800'}`}>{note.note}</p>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {note.createdBy}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {note.createdAt ? formatDate(note.createdAt) : 'N/A'}
                    </p>
                    {isRejection && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ This entry indicates a rejection/decline
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!sortedVerifications.length && !sortedDocuments.length && !kycSubmissionHistory.length && !kycRejections.length && !kycNotes.length && !userDetail.kycInfo && (
          <div className="text-center py-8 text-gray-500">
            No KYC history available
          </div>
        )}
      </div>

      {/* KYC Verification Details Modal */}
      {selectedVerification && (
        <KYCVerificationDetailsModal
          isOpen={isModalOpen}
          onClose={closeModal}
          verification={selectedVerification}
        />
      )}
    </>
  );
};
/* -------------------------------------------------------------------------- */
/* Transaction Password Modal */
/* -------------------------------------------------------------------------- */
const TransactionPasswordModal = ({ isOpen, onClose, userId, refreshData }) => {
  const [formData, setFormData] = useState({
    transactionPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.transactionPassword) {
      newErrors.transactionPassword = "Transaction password is required";
    } else if (formData.transactionPassword.length < 4) {
      newErrors.transactionPassword = "Transaction password must be at least 4 characters long";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.transactionPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await axios.put(
        `${base_url}/admin/users/${userId}/transaction-password`,
        {
          transactionPassword: formData.transactionPassword
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
          }
        }
      );
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: response.data.message || 'Transaction password updated successfully'
        });
        setFormData({ transactionPassword: '', confirmPassword: '' });
        setErrors({});
        setTimeout(() => {
          refreshData();
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Error updating transaction password:", error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update transaction password'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleClose = () => {
    setFormData({ transactionPassword: '', confirmPassword: '' });
    setErrors({});
    setMessage({ type: '', text: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Update Transaction Password</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {message.text && (
          <div
            className={`p-3 rounded mb-4 ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="transactionPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Transaction Password *
            </label>
            <input
              type="password"
              id="transactionPassword"
              name="transactionPassword"
              value={formData.transactionPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.transactionPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter new transaction password"
              disabled={loading}
            />
            {errors.transactionPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.transactionPassword}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 4 characters long
            </p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm transaction password"
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Bonus Details Section */
/* -------------------------------------------------------------------------- */
const BonusDetailsSection = ({ userDetail, bonusActivityLogs }) => {
  const [showAllBonuses, setShowAllBonuses] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!userDetail) return;
    const accountCreated = new Date(userDetail.createdAt);
    const now = new Date();
    const ageInDays = Math.floor((now - accountCreated) / (1000 * 60 * 60 * 24));
    if (ageInDays >= 3) {
      setCountdown('Expired');
      return;
    }
    const threeDaysFromCreation = new Date(accountCreated);
    threeDaysFromCreation.setDate(threeDaysFromCreation.getDate() + 3);
    const updateCountdown = () => {
      const timeLeft = threeDaysFromCreation - new Date();
      if (timeLeft <= 0) {
        setCountdown('Expired');
        return;
      }
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [userDetail]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const getBonusStatusBadge = (status, reason = '') => {
    const base = "text-xs px-2.5 py-1 rounded-full font-medium";
    switch (status?.toLowerCase()) {
      case "active": return <span className={`${base} bg-green-100 text-green-800 border-[1px] border-green-500`}>Active</span>;
      case "claimed": return <span className={`${base} bg-blue-100 text-blue-800 border-[1px] border-blue-500`}>Claimed</span>;
      case "expired": return <span className={`${base} bg-red-100 text-red-800 border-[1px] border-red-500`}>Expired</span>;
      case "available": return <span className={`${base} bg-yellow-100 text-yellow-800 border-[1px] border-yellow-500`}>Available</span>;
      case "unavailable":
        return <span className={`${base} bg-gray-100 text-gray-700 border-[1px] border-gray-600`} title={reason}>Unavailable</span>;
      case "not_eligible":
        return <span className={`${base} bg-gray-100 text-gray-700 border-[1px] border-gray-300`} title={reason}>Not Eligible</span>;
      case "cancelled":
        return <span className={`${base} bg-orange-100 text-orange-800 border-[1px] border-orange-500`}>Cancelled</span>;
      case "completed":
        return <span className={`${base} bg-purple-100 text-purple-800 border-[1px] border-purple-500`}>Completed</span>;
      default: return <span className={`${base} bg-gray-100 text-gray-800 border-[1px] border-gray-500`}>{status || 'N/A'}</span>;
    }
  };

  const getBonusTypeName = (bonusType) => {
    const typeMap = {
      "first_deposit": "First 3% Deposit Bonus",
      "special_bonus": "150% Deposit Bonus",
      "level_up": "Level Up Bonus",
      "weekly_bonus": "Weekly Bonus",
      "monthly_bonus": "Monthly Bonus",
      "referral_bonus": "Referral Bonus",
      "welcome_bonus": "Welcome Bonus",
      "transfer_to_main": "Bonus Transfer to Main"
    };
    return typeMap[bonusType] || bonusType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown Bonus';
  };

  const getFirstDepositBonusStatus = () => {
    const ageInDays = Math.floor((new Date() - new Date(userDetail.createdAt)) / (1000 * 60 * 60 * 24));
    const hasClaimed3Percent = userDetail.bonusInfo?.firstDepositBonusClaimed === true;
    
    const hasClaimed150Percent =
      userDetail.bonusInfo?.activeBonuses?.some(b => b.bonusType === 'special_bonus') ||
      userDetail.bonusInfo?.cancelledBonuses?.some(b => b.bonusType === 'special_bonus') ||
      (bonusActivityLogs || []).some(log => log.bonusType === 'special_bonus');

    if (hasClaimed3Percent) {
      return { 
        status: 'completed', 
        amount: userDetail.bonusInfo?.firstDepositBonusAmount || 0,
        reason: 'First deposit bonus has been claimed and completed' 
      };
    }

    if (hasClaimed150Percent) {
      return { status: 'unavailable', reason: 'Already claimed a deposit bonus' };
    }
    if (ageInDays > 3) {
      return { status: 'expired', reason: 'Account older than 3 days' };
    }
    const active = userDetail.bonusInfo?.activeBonuses?.find(b => b.bonusType === 'first_deposit' && b.status === 'active');
    if (active) {
      return { status: 'active', amount: active.amount, expiresAt: active.expiresAt };
    }
    if ((userDetail.total_deposit || 0) > 0) {
      return { status: 'not_eligible', reason: 'Already made a deposit without claiming' };
    }
    return { status: 'available', expiresIn: countdown };
  };

  const getSpecialBonusStatus = () => {
    const ageInDays = Math.floor((new Date() - new Date(userDetail.createdAt)) / (1000 * 60 * 60 * 24));

    const hasClaimed3Percent = userDetail.bonusInfo?.firstDepositBonusClaimed === true;

    const completedTransferBonus = (bonusActivityLogs || []).find(log => 
      log.bonusType === 'transfer_to_main' && log.status === 'completed'
    );

    if (completedTransferBonus) {
      return { 
        status: 'completed', 
        amount: completedTransferBonus.bonusAmount, 
        reason: 'Bonus has been completed and transferred to main balance' 
      };
    }

    const completedSpecialBonus = (bonusActivityLogs || []).find(log => 
      log.bonusType === 'special_bonus' && log.status === 'completed'
    );

    if (completedSpecialBonus) {
      return { 
        status: 'completed', 
        amount: completedSpecialBonus.bonusAmount, 
        reason: 'Bonus has been completed and transferred to main balance' 
      };
    }

    const activeSpecialBonus = userDetail.bonusInfo?.activeBonuses?.find(b => b.bonusType === 'special_bonus');
    
    if (activeSpecialBonus) {
      return { 
        status: 'active', 
        amount: activeSpecialBonus.amount, 
        expiresAt: activeSpecialBonus.expiresAt 
      };
    }

    const cancelledSpecialBonus = userDetail.bonusInfo?.cancelledBonuses?.find(b => b.bonusType === 'special_bonus');
    
    if (cancelledSpecialBonus) {
      return { 
        status: 'cancelled', 
        amount: cancelledSpecialBonus.amount, 
        reason: cancelledSpecialBonus.cancellationReason || 'Bonus was cancelled' 
      };
    }

    if (hasClaimed3Percent) {
      return { status: 'unavailable', reason: 'Already claimed First 3% Deposit Bonus' };
    }

    if (ageInDays > 3) {
      return { status: 'expired', reason: 'Account older than 3 days' };
    }

    const hasNoActiveBonuses = !userDetail.bonusInfo?.activeBonuses?.length;
    const lowDeposit = (userDetail.total_deposit || 0) < 30000;
    
    if (hasNoActiveBonuses && lowDeposit) {
      return { status: 'available', expiresIn: countdown };
    }

    return { status: 'not_eligible', reason: 'Does not meet eligibility criteria' };
  };

  const firstDepositBonus = getFirstDepositBonusStatus();
  const specialBonus = getSpecialBonusStatus();

  const isBonusTaken = firstDepositBonus.status === 'completed' || 
                      firstDepositBonus.status === 'active' || 
                      specialBonus.status === 'completed' || 
                      specialBonus.status === 'active';

  const getAllBonusLogs = () => {
    const logs = [];
    
    if (firstDepositBonus.status === 'completed' || firstDepositBonus.status === 'active') {
      const firstDepositLog = (bonusActivityLogs || []).find(log => log.bonusType === 'first_deposit');
      if (firstDepositLog) {
        logs.push({
          type: 'first_deposit',
          name: 'First 3% Deposit Bonus',
          amount: firstDepositLog.bonusAmount,
          status: firstDepositLog.status,
          details: `Deposit: ৳${firstDepositLog.depositAmount?.toFixed(2) || '0.00'}`,
          date: firstDepositLog.activatedAt || firstDepositLog.createdAt
        });
      }
    }
    
    if (specialBonus.status === 'completed') {
      const specialBonusLog = (bonusActivityLogs || []).find(log => 
        (log.bonusType === 'transfer_to_main' || log.bonusType === 'special_bonus') && 
        log.status === 'completed'
      );
      if (specialBonusLog) {
        logs.push({
          type: 'special_bonus',
          name: '150% Deposit Bonus',
          amount: specialBonusLog.bonusAmount,
          status: 'completed',
          details: `Deposit: ৳300.00`,
          date: specialBonusLog.activatedAt || specialBonusLog.createdAt
        });
      }
    }
    
    return logs.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  };

  const bonusLogs = getAllBonusLogs();
  const hasBonusLogs = bonusLogs.length > 0;
  const hasLevelUpBonuses = userDetail.levelInfo?.levelUpBonuses?.length > 0;

  const ageInDays = Math.floor((new Date() - new Date(userDetail.createdAt)) / (1000 * 60 * 60 * 24));
  
  const bonusEligibilityText = isBonusTaken 
    ? 'Bonus Taken' 
    : ageInDays >= 3 
      ? 'Expired' 
      : `Eligible – Expires in: ${countdown}`;

  const bonusEligibilityColor = isBonusTaken 
    ? 'text-purple-600' 
    : ageInDays >= 3 
      ? 'text-red-600' 
      : 'text-green-600';

  return (
    <div className="bg-white p-6 rounded-[5px] shadow-md border border-orange-300">
      <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <FaGift className="mr-2 text-orange-500" /> Bonus Information
        </div>
        <button
          onClick={() => setShowAllBonuses(!showAllBonuses)}
          className="text-blue-500 hover:text-blue-700"
        >
          {showAllBonuses ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Account Age:</span>
          <span className="font-medium">{ageInDays} days</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Bonus Eligibility:</span>
          <span className={`font-medium ${bonusEligibilityColor}`}>
            {bonusEligibilityText}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">First 3% Deposit Bonus:</span>
          {getBonusStatusBadge(firstDepositBonus.status, firstDepositBonus.reason)}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">150% Deposit Bonus:</span>
          {getBonusStatusBadge(specialBonus.status, specialBonus.reason)}
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Bonus Wagering Total:</span>
          <span className="font-medium">৳{userDetail.bonusInfo?.bonusWageringTotal?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Active Bonuses:</span>
          <span className="font-medium">{userDetail.bonusInfo?.activeBonuses?.length || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Cancelled Bonuses:</span>
          <span className="font-medium">{userDetail.bonusInfo?.cancelledBonuses?.length || 0}</span>
        </div>
      </div>

      {showAllBonuses && (
        <>
          {hasBonusLogs && (
            <>
              <h4 className="font-semibold mt-8 mb-3 text-lg flex items-center justify-between">
                <span>Bonus Logs</span>
              </h4>
              <div className="overflow-x-auto border-[1px] border-gray-200 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Bonus Type</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Bonus Amount</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Deposited</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Claimed At</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonusLogs.map((bonus, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{bonus.name}</td>
                        <td className="px-4 py-3">৳{bonus.amount?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-3">{bonus.details}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {bonus.date ? formatDate(bonus.date) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {getBonusStatusBadge(bonus.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {hasLevelUpBonuses && (
            <>
              <h4 className="font-semibold mt-8 mb-3 text-lg flex items-center justify-between">
                <span>Level Up Bonus Logs</span>
              </h4>
              <div className="overflow-x-auto border-[1px] border-gray-200 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Level</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Bonus Amount</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Threshold</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Claimed At</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userDetail.levelInfo.levelUpBonuses.map((bonus, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{bonus.levelName}</td>
                        <td className="px-4 py-3">৳{bonus.bonusAmount?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-3">৳{bonus.levelThreshold?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {bonus.claimedAt ? formatDate(bonus.claimedAt) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {getBonusStatusBadge(bonus.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!hasBonusLogs && !hasLevelUpBonuses && (
            <div className="text-center py-8 text-gray-500">
              No bonus logs available
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Revenue Section */
/* -------------------------------------------------------------------------- */
const RevenueSection = ({ userDetail }) => {
  const calculateRevenue = () => {
    const totalDeposit = userDetail.lifetime_deposit || 0;
    const totalWithdraw = userDetail.lifetime_withdraw || 0;
    const totalWins = userDetail.total_wins || 0;
    const totalBet = userDetail.total_bet || 0;

    const netRevenue = totalDeposit - totalWithdraw;
    const grossGamingRevenue = totalBet - totalWins;
    const netGamingRevenue = grossGamingRevenue - (userDetail.bonusBalance || 0);

    return {
      netRevenue,
      grossGamingRevenue,
      netGamingRevenue,
      totalDeposit,
      totalWithdraw,
      totalBet,
      totalWins
    };
  };

  const revenue = calculateRevenue();

  return (
    <div className="bg-white p-6 rounded-[5px] shadow-md border border-green-300">
      <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
        <FaMoneyBillAlt className="mr-2 text-green-500" /> Revenue from User
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Deposits:</span>
          <span className="font-medium">৳{revenue.totalDeposit.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Withdrawals:</span>
          <span className="font-medium">৳{revenue.totalWithdraw.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Bets:</span>
          <span className="font-medium">৳{revenue.totalBet.toFixed(2)}</span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between text-xl font-bold">
            <span className="text-gray-800">Net Revenue:</span>
            <span className={`${revenue.netRevenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ৳{revenue.netRevenue.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">(Total Deposits - Total Withdrawals)</p>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Spin History Section */
/* -------------------------------------------------------------------------- */
const SpinHistorySection = ({ spinHistory, loading }) => {
  const [showAllSpins, setShowAllSpins] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "won":
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Won</span>;
      case "lost":
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Lost</span>;
      case "pending":
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Pending</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">{status || 'N/A'}</span>;
    }
  };

  const displayedSpins = showAllSpins ? spinHistory : spinHistory.slice(0, 5);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-[5px] shadow-md border border-purple-300">
        <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
          <FaGift className="mr-2 text-purple-500" /> Spin History
        </h3>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-[5px] shadow-md border border-purple-300">
      <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <FaGift className="mr-2 text-purple-500" /> Spin History
        </div>
        <button
          onClick={() => setShowAllSpins(!showAllSpins)}
          className="text-blue-500 hover:text-blue-700"
        >
          {showAllSpins ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </h3>
      {spinHistory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No spin history found
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border-[1px] border-gray-200 border-b-0">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Transaction ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Result</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Spin Date</th>
                </tr>
              </thead>
              <tbody>
                {displayedSpins.map((spin, index) => (
                  <tr key={spin._id || index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-xs">{spin.transactionId}</td>
                    <td className="px-4 py-3">৳{spin.amount?.toFixed(2) || '0.00'}</td>
                    <td className="px-4 py-3">{spin.result}</td>
                    <td className="px-4 py-3">
                      {getStatusBadge(spin.status)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(spin.spinDate || spin.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {spinHistory.length > 5 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllSpins(!showAllSpins)}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                {showAllSpins ? 'Show Less' : `Show All (${spinHistory.length} spins)`}
              </button>
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg border-[1px] border-gray-200">
              <p className="text-gray-600">Total Spins</p>
              <p className="font-semibold text-lg">{spinHistory.length}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border-[1px] border-gray-200">
              <p className="text-gray-600">Won Spins</p>
              <p className="font-semibold text-lg text-green-600">
                {spinHistory.filter(spin => spin.status === 'won').length}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border-[1px] border-gray-200">
              <p className="text-gray-600">Lost Spins</p>
              <p className="font-semibold text-lg text-red-600">
                {spinHistory.filter(spin => spin.status === 'lost').length}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border-[1px] border-gray-200">
              <p className="text-gray-600">Total Amount</p>
              <p className="font-semibold text-lg">
                ৳{spinHistory.reduce((total, spin) => total + (spin.amount || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Referral Bonus History Section */
/* -------------------------------------------------------------------------- */
const ReferralBonusHistorySection = ({ userDetail }) => {
  const [showAllReferralBonuses, setShowAllReferralBonuses] = useState(false);

  // Filter referral bonus transactions from depositHistory
  const getReferralBonusTransactions = () => {
    if (!userDetail.depositHistory) return [];
    
    return userDetail.transactionHistory.filter(transaction => 
      transaction.type === 'referral_commission'
    );
  };

  const referralBonusTransactions = getReferralBonusTransactions();
  const displayedTransactions = showAllReferralBonuses 
    ? referralBonusTransactions 
    : referralBonusTransactions.slice(0, 5);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (type) => {
    switch (type) {
      case "bonus":
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Bonus</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">{type || 'N/A'}</span>;
    }
  };

  // Calculate total referral bonus earned
  const totalReferralBonus = referralBonusTransactions.reduce((total, transaction) => 
    total + (transaction.amount || 0), 0
  );

  return (
    <div className="bg-white p-6 rounded-[5px] shadow-md border border-blue-300">
      <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <FaGift className="mr-2 text-blue-500" /> Referral Bonus History
        </div>
        <button
          onClick={() => setShowAllReferralBonuses(!showAllReferralBonuses)}
          className="text-blue-500 hover:text-blue-700"
        >
          {showAllReferralBonuses ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </h3>

      {referralBonusTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No referral bonus transactions found
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border-[1px] border-gray-200 border-b-0">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Transaction ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Description</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {displayedTransactions.map((transaction, index) => (
                  <tr key={transaction._id || index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-xs">
                      {transaction.referenceId || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-600 font-semibold">
                        +৳{transaction.amount?.toFixed(2) || '0.00'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {transaction.description || 'Referral commission'}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(transaction.type)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(transaction.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {referralBonusTransactions.length > 5 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllReferralBonuses(!showAllReferralBonuses)}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                {showAllReferralBonuses ? 'Show Less' : `Show All (${referralBonusTransactions.length} transactions)`}
              </button>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg border-[1px] border-gray-200">
              <p className="text-gray-600">Total Transactions</p>
              <p className="font-semibold text-lg">{referralBonusTransactions.length}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border-[1px] border-gray-200">
              <p className="text-gray-600">Total Bonus Earned</p>
              <p className="font-semibold text-lg text-green-600">
                ৳{totalReferralBonus.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border-[1px] border-gray-200">
              <p className="text-gray-600">Average Bonus</p>
              <p className="font-semibold text-lg">
                ৳{(totalReferralBonus / referralBonusTransactions.length).toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border-[1px] border-gray-200">
              <p className="text-gray-600">Latest Bonus</p>
              <p className="font-semibold text-lg text-blue-600">
                ৳{referralBonusTransactions[0]?.amount?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Component */
/* -------------------------------------------------------------------------- */
const UserDetail = () => {
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const [financialData, setFinancialData] = useState({
    totalDeposit: 0,
    totalWithdraw: 0,
    todaysDeposit: 0,
    todaysWithdraw: 0,
    depositDifference: 0,
    depositPercentageDifference: 0,
    withdrawDifference: 0,
    withdrawPercentageDifference: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubtractModalOpen, setIsSubtractModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isWithdrawalBanModalOpen, setIsWithdrawalBanModalOpen] = useState(false);
  const [isTransactionPasswordModalOpen, setIsTransactionPasswordModalOpen] = useState(false);
  const [isKYCStatusModalOpen, setIsKYCStatusModalOpen] = useState(false);
  const [bonusActivityLogs, setBonusActivityLogs] = useState([]);
  const [referralDetails, setReferralDetails] = useState(null);
  const [showReferralDetails, setShowReferralDetails] = useState(false);
  const [spinHistory, setSpinHistory] = useState([]);
  const [spinHistoryLoading, setSpinHistoryLoading] = useState(false);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const [userRes, financialRes, referralRes, spinRes] = await Promise.all([
        axios.get(`${base_url}/admin/single-user-details/${id}`),
        axios.get(`${base_url}/admin/user-financials/${id}`),
        axios.get(`${base_url}/user/referred-users-details/${id}`),
        axios.get(`${base_url}/admin/spin-history/${id}`)
      ]);
    console.log(userRes);
      if (userRes.data.success) {
        setUserDetail(userRes.data.data);
        setBonusActivityLogs(userRes.data.data.bonusActivityLogs || []);
      }
      if (financialRes.data.success) {
        setFinancialData(financialRes.data);
      }
      if (referralRes.data.success) {
        console.log(referralRes.data.data);
        setReferralDetails(referralRes.data.data);
      }
      if (spinRes.data.success) {
        setSpinHistory(spinRes.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpinHistory = async () => {
    try {
      setSpinHistoryLoading(true);
      const response = await axios.get(`${base_url}/admin/spin-history/${id}`);
      if (response.data) {
        setSpinHistory(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching spin history:", error);
    } finally {
      setSpinHistoryLoading(false);
    }
  };

  const handleWithdrawalBanAction = async (action, reason, durationDays) => {
    try {
      let endpoint = "";
      let payload = {};

      if (action === "ban") {
        endpoint = `${base_url}/admin/users/${id}/withdrawal-ban`;
        payload = { reason, banDurationDays: durationDays };
      } else {
        endpoint = `${base_url}/admin/users/${id}/withdrawal-unban`;
        payload = { reason };
      }

      const response = await axios.post(endpoint, payload);

      if (response.data.success) {
        fetchUserDetails();
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Error updating withdrawal ban status:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update withdrawal ban status"
      };
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchSpinHistory();
  }, [id]);

  if (loading) {
    return (
      <section className="w-full font-bai bg-gray-100 min-h-screen">
        <Header />
        <div className="p-4 min-w-full flex justify-center items-center h-screen">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
              <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-cyan-500/20 blur-sm"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!userDetail) {
    return (
      <section className="w-full font-bai bg-gray-100 min-h-screen">
        <Header />
        <div className="p-4 min-w-full flex justify-center items-center h-screen">
          <p className="text-red-500 text-lg">User not found</p>
        </div>
      </section>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</span>;
      case "banned":
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Banned</span>;
      case "pending":
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Pending</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">{status}</span>;
    }
  };

  const getWithdrawalBanStatus = () => {
    if (!userDetail.withdrawalBanned) {
      return { status: "active", badge: <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Allowed</span> };
    }
    if (userDetail.withdrawalUnbanDate && new Date() > new Date(userDetail.withdrawalUnbanDate)) {
      return { status: "expired", badge: <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Expired</span> };
    }
    return { status: "banned", badge: <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Banned</span> };
  };

  const withdrawalBanStatus = getWithdrawalBanStatus();

  const calculateWageringInfo = () => {
    const totalDeposit = userDetail.total_deposit || 0;
    const totalBet = userDetail.lifetime_bet || 0;

    if (totalDeposit === 0) return { multiple: 0, status: "No deposits" };

    const multiple = (totalBet / totalDeposit).toFixed(2);
    let status = "";

    if (multiple < 1) status = "Low";
    else if (multiple < 3) status = "Moderate";
    else if (multiple < 5) status = "Good";
    else status = "Excellent";

    return { multiple, status };
  };

  const wageringInfo = calculateWageringInfo();

  const currentLevel = levels.slice().reverse().find(level => userDetail.lifetime_bet >= level.threshold) || levels[0];
  const nextLevel = levels.find(level => level.threshold > userDetail.lifetime_bet) || levels[levels.length - 1];
  const progressPercentage = currentLevel.name === nextLevel.name
    ? 100
    : Math.min(100, ((userDetail.lifetime_bet - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100).toFixed(0);

  return (
    <section className="w-full font-bai bg-gray-100 min-h-screen text-gray-700">
      <Header />
      <div className="p-4 min-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[25px] font-semibold text-black">User Detail - {userDetail?.name || userDetail?.username}</h2>
        </div>

        <section className="mb-[20px]">
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-200 p-4 rounded-sm shadow bg-white">
              <span className="flex items-center text-lg font-medium text-black">
                <FaWallet className="mr-2 text-indigo-500" size={20} />
                Today Deposit
              </span>
              <p className="text-3xl font-semibold text-black">৳{financialData.todaysDeposit.toFixed(2)}</p>
              <div className={`mt-2 text-sm ${financialData.depositDifference > 0 ? "text-green-600" : "text-red-600"}`}>
                {financialData.depositDifference > 0 ? "↑" : "↓"} {Math.abs(financialData.depositDifference)} ৳ ({financialData.depositPercentageDifference}%)
              </div>
            </div>
            <div className="border border-gray-200 p-4 rounded-sm shadow bg-white">
              <span className="flex items-center text-lg font-medium text-black">
                <BsBank className="mr-2 text-orange-500" size={20} />
                Today Withdraw
              </span>
              <p className="text-3xl font-semibold text-black">৳{financialData.todaysWithdraw.toFixed(2)}</p>
              <div className={`mt-2 text-sm ${financialData.withdrawDifference > 0 ? "text-green-600" : "text-red-600"}`}>
                {financialData.withdrawDifference > 0 ? "↑" : "↓"} {Math.abs(financialData.withdrawDifference)} ৳ ({financialData.withdrawPercentageDifference}%)
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <NavLink to={`/reports/transaction-history?q=${userDetail?.email}`}>
            <div className="flex items-center bg-white border-[1px] h-full border-gray-400 text-gray-700 px-4 py-[25px] rounded-sm shadow-md hover:shadow-sm transition-colors">
              <div className="flex-1">
                <p className="text-sm">Balance</p>
                <h3 className="text-xl font-bold">৳{userDetail?.balance?.toFixed(2) || '0.00'} BDT</h3>
              </div>
              <div className="p-[10px] bg-blue-600 rounded-full text-white flex items-center justify-center">
                <FaBangladeshiTakaSign size={24} />
              </div>
            </div>
          </NavLink>
          <NavLink to={`/deposits/single-deposit-history/${userDetail._id}`}>
            <div className="flex items-center bg-white h-full border-[1px] border-gray-400 text-gray-700 px-4 py-[25px] rounded-sm shadow-md hover:shadow-sm transition-colors">
              <div className="flex-1">
                <p className="text-sm">Deposits</p>
                <h3 className="text-xl font-bold">৳{userDetail?.total_deposit?.toFixed(2) || '0.00'} BDT</h3>
              </div>
              <div className="p-[10px] bg-green-600 rounded-full text-white flex items-center justify-center">
                <FaWallet size={24} />
              </div>
            </div>
          </NavLink>
          <NavLink to={`/withdraw/single-withdraw-history/${userDetail._id}`}>
            <div className="flex items-center bg-white h-full border-[1px] border-gray-400 text-gray-700 px-4 py-[25px] rounded-sm shadow-md hover:shadow-sm transition-colors">
              <div className="flex-1">
                <p className="text-sm">Withdrawals</p>
                <h3 className="text-xl font-bold">৳{userDetail?.total_withdraw?.toFixed(2) || '0.00'} BDT</h3>
              </div>
              <div className="p-[10px] bg-orange-600 rounded-full text-white flex items-center justify-center">
                <BsBank size={24} />
              </div>
            </div>
          </NavLink>
          <div className="flex items-center bg-white h-full border-[1px] border-gray-400 text-gray-700 px-4 py-[25px] rounded-sm shadow-md hover:shadow-sm transition-colors">
            <div className="flex-1">
              <p className="text-sm">Transactions</p>
              <h3 className="text-xl font-bold">{userDetail?.transactionHistory?.length || 0}</h3>
            </div>
            <div className="p-[10px] bg-purple-600 rounded-full text-white flex items-center justify-center">
              <FaExchangeAlt size={24} />
            </div>
          </div>
          <NavLink to={`/users/bet-history/${userDetail._id}?player_id=${userDetail.player_id}`}>
            <div className="flex items-center bg-white h-full border-[1px] border-gray-400 text-gray-700 px-4 py-[25px] rounded-sm shadow-md hover:shadow-sm transition-colors">
              <div className="flex-1">
                <p className="text-sm">Bet History</p>
                <h3 className="text-[12px] font-bold mt-2">Life Time Bet ৳{userDetail.lifetime_bet.toFixed(2) || '0.00'} BDT</h3>
              </div>
              <div className="p-[10px] bg-orange-600 rounded-full text-white flex items-center justify-center">
                <LuGamepad size={24} />
              </div>
            </div>
          </NavLink>
        </div>

        <div className="w-full grid grid-cols-2 md:grid-cols-6 text-nowrap gap-4 bg-white rounded-lg mb-6">
          <button onClick={() => setIsModalOpen(true)} className="flex justify-center items-center gap-2 bg-green-500 text-white text-[18px] px-6 py-2 rounded-[4px] shadow-md hover:bg-green-600 transition-colors">
            <MdOutlineAccountBalanceWallet className="text-[20px]" /> Add Balance
          </button>
          <button onClick={() => setIsSubtractModalOpen(true)} className="flex justify-center items-center gap-2 bg-red-500 text-white px-6 py-2 text-[18px] rounded-[4px] shadow-md hover:bg-red-600 transition-colors">
            <FiMinusCircle className="text-[20px]" /> Subtract Balance
          </button>
          <NavLink to={`/report/login/history?name=${userDetail.name || userDetail.username}`} className="flex justify-center items-center gap-2 bg-blue-600 text-[18px] text-white px-6 py-2 rounded-[4px] shadow-md hover:bg-blue-700 transition-colors">
            <RiLoginCircleLine className="text-[20px]" /> Logins
          </NavLink>
          <NavLink className="flex justify-center items-center gap-2 bg-[#868E96] text-[18px] text-white px-6 py-2 rounded-[4px] shadow-md hover:bg-gray-600 transition-colors" to={`/report/notification/history?email=${userDetail.email}`}>
            <FaBell className="text-[20px]" /> Notifications
          </NavLink>
          <button onClick={() => setIsBanModalOpen(true)} className="flex justify-center items-center gap-2 bg-[#FF9F43] text-[18px] text-white px-6 py-2 rounded-[4px] shadow-md hover:bg-orange-500 transition-colors">
            <IoBanSharp className="text-[20px]" /> {userDetail.status === 'active' ? 'Ban User' : 'Unban User'}
          </button>
          <button onClick={() => setIsWithdrawalBanModalOpen(true)} className="flex justify-center items-center gap-2 bg-[#7367F0] text-[18px] text-white px-6 py-2 rounded-[4px] shadow-md hover:bg-purple-600 transition-colors">
            <IoBanSharp className="text-[20px]" /> {userDetail.withdrawalBanned ? 'Withdrawal Unban' : 'Withdrawal Ban'}
          </button>
        </div>

        {/* NEW: KYC Status Button */}
        <div className="w-full mb-6">
          <button 
            onClick={() => setIsKYCStatusModalOpen(true)}
            className="flex justify-center items-center gap-2 bg-indigo-600 text-white text-[18px] px-6 py-3 rounded-[4px] shadow-md hover:bg-indigo-700 transition-colors w-full"
          >
            <FaCheckCircle className="text-[20px]" /> 
            Update KYC Submission Status: {userDetail.kycSubmitted ? 'Submitted' : 'Not Submitted'}
          </button>
        </div>

        <AddBalanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userId={userDetail._id} refreshData={fetchUserDetails} />
        <SubtractBalanceModal isOpen={isSubtractModalOpen} onClose={() => setIsSubtractModalOpen(false)} userId={userDetail._id} refreshData={fetchUserDetails} />
        <BanUserModal isOpen={isBanModalOpen} onClose={() => setIsBanModalOpen(false)} userId={userDetail._id} currentStatus={userDetail.status} refreshData={fetchUserDetails} />
        <WithdrawalBanModal
          isOpen={isWithdrawalBanModalOpen}
          onClose={() => setIsWithdrawalBanModalOpen(false)}
          userId={userDetail._id}
          currentStatus={userDetail.withdrawalBanned}
          banReason={userDetail.withdrawalBanReason}
          banDate={userDetail.withdrawalBanDate}
          unbanDate={userDetail.withdrawalUnbanDate}
          onAction={handleWithdrawalBanAction}
        />
        <TransactionPasswordModal
          isOpen={isTransactionPasswordModalOpen}
          onClose={() => setIsTransactionPasswordModalOpen(false)}
          userId={userDetail._id}
          refreshData={fetchUserDetails}
        />
        <KYCStatusModal
          isOpen={isKYCStatusModalOpen}
          onClose={() => setIsKYCStatusModalOpen(false)}
          userId={userDetail._id}
          currentKYCStatus={userDetail.kycSubmitted || false}
          refreshData={fetchUserDetails}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-gray-700">
          <div className="bg-white p-6 rounded-[5px] shadow-md border border-blue-300">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
              <FaUser className="mr-2 text-blue-500" /> Basic Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <FaUser className="text-gray-500 mr-3 w-5" />
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium">{userDetail.username}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-gray-500 mr-3 w-5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{userDetail.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-gray-500 mr-3 w-5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{userDetail.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MdVerifiedUser className="text-gray-500 mr-3 w-5" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="font-medium">{getStatusBadge(userDetail.status)}</div>
                </div>
              </div>
              <div className="flex items-center">
                <TbPasswordUser className="text-gray-500 mr-3 w-5" />
                <div>
                  <p className="text-sm text-gray-500">Password Set</p>
                  <p className="font-medium">Yes</p>
                </div>
              </div>
              <div className="flex items-center">
                <GiCash className="text-gray-500 mr-3 w-5" />
                <div>
                  <p className="text-sm text-gray-500">Transaction Password</p>
                  <p className="font-medium">{userDetail.isMoneyTransferPasswordSet ? "Set" : "Not Set"}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="text-gray-500 mr-3 w-5" />
                <div>
                  <p className="text-sm text-gray-500">KYC Submitted</p>
                  <p className={`font-medium ${userDetail.kycSubmitted ? 'text-green-600' : 'text-red-600'}`}>
                    {userDetail.kycSubmitted ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="text-gray-500 mr-3 w-5" />
                <div>
                  <p className="text-sm text-gray-500">KYC Completed</p>
                  <p className={`font-medium ${userDetail.kycCompleted ? 'text-green-600' : 'text-red-600'}`}>
                    {userDetail.kycCompleted ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[5px] shadow-md border border-green-300">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
              <MdOutlineAccountBalanceWallet className="mr-2 text-green-500" /> Account Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <FaBangladeshiTakaSign className="text-gray-500 mr-3 w-5" />
                <div>
                  <p className="text-sm text-gray-500">Player ID</p>
                  <p className="font-medium">{userDetail.player_id}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaBangladeshiTakaSign className="text-gray-500 mr-3 w-5" />
                <div>
                  <p className="text-sm text-gray-500">Currency</p>
                  <p className="font-medium">{userDetail.currency}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaBangladeshiTakaSign className="text-gray-500 mr-3 w-5" />
                <div>
                  <p className="text-sm text-gray-500">Main Balance</p>
                  <p className="font-medium">৳{userDetail.balance?.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaBangladeshiTakaSign className="text-gray-500 mr-3 w-5" />
                <div>
                  <p className="text-sm text-gray-500">Bonus Balance</p>
                  <p className="font-medium">৳{userDetail.bonusBalance?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaBangladeshiTakaSign className="text-gray-500 mr-3 w-5" />
                <div>
                  <p className="text-sm text-gray-500">Withdrawal Status</p>
                  <div className="font-medium">{withdrawalBanStatus.badge}</div>
                </div>
              </div>
              <div className="flex items-center">
                <img src={currentLevel.icon} alt={currentLevel.name} className="w-5 h-5 text-gray-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-blue-500 font-[600]">User Level</p>
                  <p className="font-medium">{currentLevel.name}</p>
                  {currentLevel.name !== nextLevel.name && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 font-[600] mb-1">Progress to {nextLevel.name}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${currentLevel.progressColor}`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        ৳{userDetail.lifetime_bet.toFixed(2)} / ৳{nextLevel.threshold.toFixed(2)} ({progressPercentage}%)
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {userDetail.withdrawalBanned && (
                <>
                  <div className="flex items-center">
                    <FaBangladeshiTakaSign className="text-gray-500 mr-3 w-5" />
                    <div>
                      <p className="text-sm text-gray-500">Ban Reason</p>
                      <p className="font-medium">{userDetail.withdrawalBanReason || "Not specified"}</p>
                    </div>
                  </div>
                  {userDetail.withdrawalUnbanDate && (
                    <div className="flex items-center">
                      <FaBangladeshiTakaSign className="text-gray-500 mr-3 w-5" />
                      <div>
                        <p className="text-sm text-gray-500">Unban Date</p>
                        <p className="font-medium">{formatDate(userDetail.withdrawalUnbanDate)}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-gray-700">
          <div className="bg-white p-6 rounded-[5px] shadow-md border border-purple-300">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
              <LuGamepad className="mr-2 text-purple-500" /> Betting Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Bets:</span>
                <span className="font-medium">৳{userDetail.lifetime_bet?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Wins:</span>
                <span className="font-medium">৳{userDetail.total_wins?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Loss:</span>
                <span className="font-medium">৳{userDetail.total_loss?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Net Profit:</span>
                <span className={`font-medium ${userDetail.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ৳{userDetail.net_profit?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Wagered:</span>
                <span className="font-medium">৳{userDetail.totalWagered?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Wagering Multiple:</span>
                <span className="font-medium">{wageringInfo.multiple}x ({wageringInfo.status})</span>
              </div>
            </div>
          </div>
          <RevenueSection userDetail={userDetail} />
        </div>

        {/* NEW: Weekly/Monthly Bonus Section */}
        <div className="mb-6">
          <WeeklyMonthlyBonusSection userDetail={userDetail} />
        </div>

        <div className="mb-6">
          <SpinHistorySection spinHistory={spinHistory} loading={spinHistoryLoading} />
        </div>

        {/* NEW: Referral Bonus History Section */}
        <div className="mb-6">
          <ReferralBonusHistorySection userDetail={userDetail} />
        </div>

        {/* NEW: KYC History Section */}
        <div className="mb-6">
          <KYCHistorySection userDetail={userDetail} />
        </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-gray-700">
  <div className="bg-white p-6 rounded-[5px] shadow-md border border-blue-300">
    <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center">
        <FaUser className="mr-2 text-blue-500" /> Referral Information
      </div>
      <button
        onClick={() => setShowReferralDetails(!showReferralDetails)}
        className="text-blue-500 hover:text-blue-700"
      >
        {showReferralDetails ? <FaChevronUp /> : <FaChevronDown />}
      </button>
    </h3>
    <div className="space-y-4">
      <div className="flex justify-between">
        <span className="text-gray-600">Referral Code:</span>
        <span className="font-medium">{userDetail.referralCode}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Referred By:</span>
        <span className="font-medium">{userDetail.referredBy || 'None'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Referral Count:</span>
        <span className="font-medium">{userDetail.referralCount || 0}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Active Referrals:</span>
        <span className="font-medium">
          {userDetail.referralUsers?.filter(user => 
            user.lastActive && new Date(user.lastActive) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length || 0}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Deposited Referrals:</span>
        <span className="font-medium">
          {userDetail.referralUsers?.filter(user => user.hasDeposited).length || 0}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Referral Earnings:</span>
        <span className="font-medium">৳{userDetail.referralEarnings?.toFixed(2) || '0.00'}</span>
      </div>
    </div>
    {showReferralDetails && userDetail.referralUsers && (
      <div className="mt-4 border-t pt-4">
        <h4 className="font-semibold mb-3">Referred Users Details</h4>
        <div className="overflow-x-auto border-[1px] border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">User ID</th>
                <th className="px-4 py-2 text-left">Joined</th>
                <th className="px-4 py-2 text-left">Earned</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {userDetail.referralUsers.length > 0 ? (
                userDetail.referralUsers.map((referral, index) => (
                  <tr key={referral._id || index} className="border-b">
                    <td className="px-4 py-2">
                      <span className="font-medium">{referral.user || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-2">{formatDate(referral.joinedAt)}</td>
                    <td className="px-4 py-2">৳{referral.earnedAmount?.toFixed(2) || '0.00'}</td>
                    <td className="px-4 py-2">
                      {referral.earnedAmount > 0 ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
                    No referred users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {userDetail.referralTracking && userDetail.referralTracking.length > 0 && (
          <div className="mt-4">
            <h5 className="font-semibold mb-2">Referral Tracking</h5>
            <div className="overflow-x-auto border-[1px] border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Referral Code Used</th>
                    <th className="px-4 py-2 text-left">Referred User</th>
                    <th className="px-4 py-2 text-left">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetail.referralTracking.map((tracking, index) => (
                    <tr key={tracking._id || index} className="border-b">
                      <td className="px-4 py-2">{tracking.referralCodeUsed}</td>
                      <td className="px-4 py-2">{tracking.referredUser}</td>
                      <td className="px-4 py-2">{formatDate(tracking.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )}
  </div>

  <div className="bg-white p-6 rounded-[5px] shadow-md border border-blue-300">
    <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
      <FaCalendarAlt className="mr-2 text-blue-500" /> Account Dates
    </h3>
    <div className="space-y-4">
      <div className="flex justify-between">
        <span className="text-gray-600">Created At:</span>
        <span className="font-medium">{formatDate(userDetail.createdAt)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Last Updated:</span>
        <span className="font-medium">{formatDate(userDetail.updatedAt)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Last Password Change:</span>
        <span className="font-medium">{formatDate(userDetail.lastPasswordChange)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Last Login:</span>
        <span className="font-medium">
          {userDetail.last_login ? formatDate(userDetail.last_login) : 'Never'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Login Count:</span>
        <span className="font-medium">{userDetail.login_count || 0}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Account Age:</span>
        <span className="font-medium">{userDetail.accountAgeInDays || 0} days</span>
      </div>
      {userDetail.withdrawalBanDate && (
        <div className="flex justify-between">
          <span className="text-gray-600">Withdrawal Ban Date:</span>
          <span className="font-medium">{formatDate(userDetail.withdrawalBanDate)}</span>
        </div>
      )}
      {userDetail.withdrawalUnbanDate && (
        <div className="flex justify-between">
          <span className="text-gray-600">Withdrawal Unban Date:</span>
          <span className="font-medium">{formatDate(userDetail.withdrawalUnbanDate)}</span>
        </div>
      )}
    </div>
  </div>
</div>

        <div className="mb-6">
          <BonusDetailsSection userDetail={userDetail} bonusActivityLogs={bonusActivityLogs} />
        </div>
      </div>
    </section>
  );
};

export default UserDetail;