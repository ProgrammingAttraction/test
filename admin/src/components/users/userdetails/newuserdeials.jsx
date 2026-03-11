import { FaWallet, FaExchangeAlt, FaMoneyBillAlt, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity, FaGlobe, FaMapPin } from "react-icons/fa";
import { BsBank } from "react-icons/bs";
import Header from "../../common/Header";
import { FaBalanceScale, FaSignInAlt, FaBell, FaUserSlash } from "react-icons/fa";
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
import { FaCalendarAlt } from "react-icons/fa";
import { FaGift } from "react-icons/fa";
const UserDetail = () => {
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const [transactionData, setTransactionData] = useState({
    totalDeposit: 0,
    totalWithdraw: 0,
    percentageDifference: 0,
    withdrawTrend: "down",
  });

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

  const [bonusActivityLogs, setBonusActivityLogs] = useState([]); // For bonus activity logs

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const [userRes, financialRes] = await Promise.all([
        axios.get(`${base_url}/admin/single-user-details/${id}`),
        axios.get(`${base_url}/admin/user-financials/${id}`),
      ]);

      if (userRes.data.success) {
        setUserDetail(userRes.data.data);
        setBonusActivityLogs(userRes.data.data.bonusActivityLogs); // Set the bonus activity logs
      }
      if (financialRes.data.success) {
        setFinancialData(financialRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);


  if (loading) {
    return (
      <section className="w-full font-bai bg-gray-100">
        <Header />
        <div className="p-4 min-w-full flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </section>
    );
  }

  if (!userDetail) {
    return (
      <section className="w-full font-bai bg-gray-100">
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

  return (
    <section className="w-full font-bai bg-gray-100">
      <Header />
      <div className="p-4 min-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[25px] font-semibold text-black">User Detail - {userDetail?.name || userDetail?.username}</h2>
          <button className="text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-100">
            <FaExchangeAlt className="inline-block mr-1" /> Login as User
          </button>
        </div>

        <section className="mb-[20px]">
          <div className="grid grid-cols-2 gap-4">
            {/* Today's Deposit Box */}
            <div className="border border-indigo-500 p-4 rounded-lg shadow">
              <span className="flex items-center text-lg font-medium text-black">
                <FaWallet className="mr-2 text-indigo-500" size={20} />
                Today Deposit
              </span>
              <p className="text-3xl font-semibold text-black">৳{financialData.todaysDeposit.toFixed(2)}</p>
              <div className={`mt-2 text-sm ${financialData.depositDifference > 0 ? "text-green-600" : "text-red-600"}`}>
                {financialData.depositDifference > 0 ? "↑" : "↓"} {Math.abs(financialData.depositDifference)} ৳ ({financialData.depositPercentageDifference}%)
              </div>
            </div>

            {/* Today's Withdraw Box */}
            <div className="border border-orange-500 p-4 rounded-lg shadow">
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

        <div className="grid grid-cols-5 gap-4 mb-4">
          <NavLink to={`/reports/transaction-history?q=${userDetail?.email}`}>
            <div className="flex items-center bg-blue-900 text-white px-4 py-[25px] rounded-lg shadow hover:bg-blue-800 transition-colors">
              <div className="flex-1">
                <p className="text-sm">Balance</p>
                <h3 className="text-xl font-bold">৳{userDetail?.balance?.toFixed(2) || '0.00'} BDT</h3>
              </div>
              <div className="p-[10px] bg-white rounded-full text-blue-600 shadow-md flex items-center justify-center">
                <FaBangladeshiTakaSign size={24} />
              </div>
            </div>
          </NavLink>

          <NavLink to={`/deposits/single-deposit-history/${userDetail._id}`}>
            <div className="flex items-center bg-teal-600 text-white px-4 py-[25px] rounded-lg shadow hover:bg-teal-700 transition-colors">
              <div className="flex-1">
                <p className="text-sm">Deposits</p>
                <h3 className="text-xl font-bold">৳{userDetail?.total_deposit?.toFixed(2) || '0.00'} BDT</h3>
              </div>
              <div className="p-[10px] bg-white rounded-full text-blue-600 shadow-md flex items-center justify-center">
                <FaWallet size={24} />
              </div>
            </div>
          </NavLink>

          <NavLink to={`/withdraw/single-withdraw-history/${userDetail._id}`}>
            <div className="flex items-center bg-orange-600 text-white px-4 py-[25px] rounded-lg shadow hover:bg-orange-700 transition-colors">
              <div className="flex-1">
                <p className="text-sm">Withdrawals</p>
                <h3 className="text-xl font-bold">৳{userDetail?.total_withdraw?.toFixed(2) || '0.00'} BDT</h3>
              </div>
              <div className="p-[10px] bg-white rounded-full text-blue-600 shadow-md flex items-center justify-center">
                <BsBank size={24} />
              </div>
            </div>
          </NavLink>

          <div className="flex items-center bg-blue-800 text-white p-4 rounded-lg shadow hover:bg-blue-900 transition-colors">
            <div className="flex-1">
              <p className="text-sm">Transactions</p>
              <h3 className="text-xl font-bold">{userDetail?.transactionHistory?.length || 0}</h3>
            </div>
            <div className="p-[10px] bg-white rounded-full text-blue-600 shadow-md flex items-center justify-center">
              <FaExchangeAlt size={24} />
            </div>
          </div>

          <NavLink to={`/users/bet-history/${userDetail._id}`}>
            <div className="flex items-center bg-purple-600 text-white px-4 py-[25px] rounded-lg shadow hover:bg-purple-700 transition-colors">
              <div className="flex-1">
                <p className="text-sm">Bet History</p>
                <h3 className="text-xl font-bold">৳{userDetail?.total_bet?.toFixed(2) || '0.00'} BDT</h3>
              </div>
              <div className="p-[10px] bg-white rounded-full text-blue-600 shadow-md flex items-center justify-center">
                <LuGamepad size={24} />
              </div>
            </div>
          </NavLink>
        </div>

        <div className="w-full grid grid-cols-5 gap-4 p-4 bg-gray-100 mb-6">
          <button onClick={() => setIsModalOpen(true)} className="flex justify-center items-center gap-2 bg-green-500 text-white text-[18px] px-6 py-2 rounded-[4px] shadow-md hover:bg-green-600 transition-colors">
            <MdOutlineAccountBalanceWallet className="text-[20px]" /> Add Balance
          </button>

          <button onClick={() => setIsSubtractModalOpen(true)} className="flex justify-center items-center gap-2 bg-red-500 text-white px-6 py-2 text-[18px] rounded-[4px] shadow-md hover:bg-red-600 transition-colors">
            <FiMinusCircle className="text-[20px]" /> Subtract Balance
          </button>

          <NavLink to={`/report/login/history?name=${userDetail.name || userDetail.username}`} className="flex justify-center items-center gap-2 bg-blue-600 text-[18px] text-white px-6 py-2 rounded-[4px] shadow-md hover:bg-blue-700 transition-colors">
            <RiLoginCircleLine className="text-[20px]" /> Logins
          </NavLink>

          <NavLink className="flex justify-center items-center gap-2 bg-[#868E96] text-[18px] text-white px-6 py-2 rounded-[4px] shadow-md hover:bg-gray-600 transition-colors" to={`/report/nptification/history?email=${userDetail.email}`}>
            <FaBell className="text-[20px]" /> Notifications
          </NavLink>

          <button onClick={() => setIsBanModalOpen(true)} className="flex justify-center items-center gap-2 bg-[#FF9F43] text-[18px] text-white px-6 py-2 rounded-[4px] shadow-md hover:bg-orange-500 transition-colors">
            <IoBanSharp className="text-[20px]" /> {userDetail.status === 'active' ? 'Ban User' : 'Unban User'}
          </button>
        </div>

        {/* Add Balance Modal */}
        <AddBalanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userId={userDetail._id} refreshData={fetchUserDetails} />
        <SubtractBalanceModal isOpen={isSubtractModalOpen} onClose={() => setIsSubtractModalOpen(false)} userId={userDetail._id} refreshData={fetchUserDetails} />
        <BanUserModal isOpen={isBanModalOpen} onClose={() => setIsBanModalOpen(false)} userId={userDetail._id} currentStatus={userDetail.status} refreshData={fetchUserDetails} />

        {/* User Information Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-gray-700">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
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
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
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
                  <p className="text-sm text-gray-500">Daily Withdrawal Limit</p>
                  <p className="font-medium">৳{userDetail.dailyWithdrawalLimit?.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaBangladeshiTakaSign className="text-gray-500 mr-3 w-5" />
                <div>
                  <p className="text-sm text-gray-500">Withdrawals Today</p>
                  <p className="font-medium">{userDetail.withdrawalCountToday || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-gray-700">
          {/* Betting Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
              <LuGamepad className="mr-2 text-purple-500" /> Betting Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Bets:</span>
                <span className="font-medium">৳{userDetail.total_bet?.toFixed(2) || '0.00'}</span>
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
            </div>
          </div>

          {/* Referral Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
              Referral Information
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
                <span className="font-medium">{userDetail.referralCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Referral Earnings:</span>
                <span className="font-medium">৳{userDetail.referralEarnings?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">First Login:</span>
                <span className="font-medium">{userDetail.first_login ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Login Count:</span>
                <span className="font-medium">{userDetail.login_count}</span>
              </div>
            </div>
          </div>
        </div>

        
        {/* Dates & History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-gray-700">
          {/* Account Dates */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
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
            </div>
          </div>

          {/* Bonus Information */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
              <FaGift className="mr-2 text-orange-500" /> Bonus Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">First Deposit Bonus:</span>
                <span className={`px-2 py-1 rounded text-xs ${userDetail.bonusInfo?.firstDepositBonusClaimed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {userDetail.bonusInfo?.firstDepositBonusClaimed ? 'Claimed' : 'Not Claimed'}
                </span>
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
          </div>
        </div>
  {/* Bonus Activity Logs Section */}
    {/* Bonus Activity Logs Section */}
<div className="bg-white p-6 rounded-lg text-gray-700 shadow-md border border-gray-200 mt-6">
  <h3 className="text-xl font-semibold mb-4 pb-2 flex items-center">
    <FaGift className="mr-2 text-orange-500" /> Bonus Activity Logs
  </h3>
  <div className="overflow-x-auto border-[1px] border-gray-200 rounded">
    <table className="min-w-full table-auto border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Bonus Type</th>
          <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Bonus Amount</th>
          <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Deposit Amount</th>
          <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Bonus Percentage</th>
          <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Received At</th>
          <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Cancelled At</th>
          <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Status</th>
        </tr>
      </thead>
      <tbody>
        {bonusActivityLogs.length === 0 ? (
          <tr>
            <td colSpan="7" className="px-4 py-2 text-center text-gray-600 border border-gray-200">No bonus activity found</td>
          </tr>
        ) : (
          bonusActivityLogs.map((log, index) => (
            <tr key={index} className="border border-gray-200">
              <td className="px-4 py-2 border border-gray-200">
                {log.bonusType === "first_bonus" ? "First Deposit Bonus" : 
                 log.bonusType === "special_bonus" ? "Special Bonus" : log.bonusType}
              </td>
              <td className="px-4 py-2 border border-gray-200">৳{log.bonusAmount.toFixed(2)}</td>
              <td className="px-4 py-2 border border-gray-200">
                {log.depositAmount > 0 ? `৳${log.depositAmount.toFixed(2)}` : "-"}
              </td>
              <td className="px-4 py-2 border border-gray-200">
                {log.bonusType === "first_bonus" ? "3% Extra Bonus" : 
                 log.bonusType === "special_bonus" ? "150% Bonus" : "-"}
              </td>
              <td className="px-4 py-2 border border-gray-200">
                {log.activatedAt ? new Date(log.activatedAt).toLocaleString() : "-"}
              </td>
              <td className="px-4 py-2 border border-gray-200">
                {log.cancelledAt ? new Date(log.cancelledAt).toLocaleString() : "-"}
              </td>
              <td className="px-4 py-2 border border-gray-200">
                <span className={`px-2 py-1 rounded text-xs ${
                  log.status === "active" ? "bg-green-100 text-green-800" : 
                  log.status === "cancelled" ? "bg-red-100 text-red-800" : 
                  "bg-gray-100 text-gray-800"
                }`}>
                  {log.status === "active" ? "Active" : 
                   log.status === "cancelled" ? "Cancelled" : "N/A"}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

      
      </div>
    </section>
  );
};

export default UserDetail;