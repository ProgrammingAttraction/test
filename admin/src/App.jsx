import { Route, Routes, useLocation, Navigate, Outlet } from "react-router-dom";
import Sidebar from "./components/common/Sidebar";
import OverviewPage from "./pages/OverviewPage";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import SalesPage from "./pages/SalesPage";
import OrdersPage from "./pages/OrdersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import AdminLogin from "./pages/AdminLogin";
import GamesTable from "./components/games/GamesTable";
import Gamelogs from "./components/games/Gamelogs";
import Activeuser from "./components/users/Activeuser";
import Pendingdeposit from "./components/depoist/Alldeposit";
import Pendingwithdraw from "./components/withdraw/Pendingwithdraw";
import Pendingticket from "./components/Support/Pendingticket";
import TransactionLogs from "./components/reports/TransactionLogs";
import Setting from "./components/system/Setting";
import Generalsettings from "./components/settings/Generalsettings";
import Reportsandrequest from "./components/request/Reportsandrequest";
import LogoFaviconUploader from "./components/system/LogoFaviconUploader";
import Configuration from "./components/system/Configuration";
import SEOConfig from "./components/system/SEOConfig";
import NotificationTemplates from "./components/system/NotificationTemplates";
import RobotsTxtForm from "./components/system/RobotsTxtForm";
import UserDetail from "./components/users/userdetails/UserDetail";
import Banneduserdetail from "./components/users/banneduser/Banneduserdetail";
import Banneduser from "./components/users/Banneduser";
import Alluser from "./components/users/Alluser";
import NotificationPage from "./components/users/NotificationPage";
import DepositRequest from "./components/depoist/deposit_details/DepositRequest";
import Withdrawdetails from "./components/withdraw/withdraw_detials/Withdrawdetails";
import Approvedwithdraw from "./components/withdraw/Approvedwithdraw";
import Rejectedwithdraw from "./components/withdraw/Rejectedwithdraw";
import Allwithdraw from "./components/withdraw/Allwithdraw";
import Successdeposit from "./components/depoist/Successdeposit";
import Alldeposit from "./components/depoist/Alldeposit";
import Faileddeposit from "./components/depoist/Faileddeposit";
import Loginhistory from "./pages/Loginhistory";
import Allnotifications from "./pages/Allnotifications";
import Singledeposithistory from "./components/depoist/Singledeposithistory";
import SingleWithdrawHistory from "./components/withdraw/withdraw_detials/SingleWithdrawHistory";
import Successwithdraw from "./components/withdraw/Successwithdraw";
import Alladmin from "./components/moderator/Alladmin";
import Superadmin from "./components/moderator/Superadmin";
import Pendingadmin from "./components/moderator/Pendingadmin";
import Createuser from "./components/moderator/Createuser";
import Addbanner from "./components/frontend/banner/Addbanner";
import Bannerlist from "./components/frontend/banner/Bannerlist";
import Gamesdetails from "./components/games/Gamesdetails";
import Notice from "./components/frontend/banner/Notice";
import Addprovider from "./components/frontend/banner/Addprovider";
import Providerlist from "./components/frontend/banner/Providerlist";
import Referal from "./components/referal/Referal";
import Newgame from "./components/gameapi/Newgame";
import Allgames from "./components/gameapi/Allgames";
import Newcategory from "./components/category/Newcategory";
import Categorylist from "./components/category/Categorylist";
import { useEffect, useState } from "react";
import axios from "axios";
import NotFound from "./pages/Notfound";
import Bethistory from "./components/users/bethistory/Bethistory";
import Allloginlogs from "./components/security/Allloginlogs";
import FailedLoginLogs from "./components/security/Failedlogin";
import Ipwhitelist from "./components/security/Ipwhitelist";
import Device from "./components/security/Device";
import SecurityDashboard from "./components/security/SecurityDashboard";
import Inactiveuser from "./components/users/Inactiveuser";
import Profile from "./components/profile/Profile";
import Spinhistory from "./components/spin/Spinhistory";
import Support from "./components/support_team/Support";
import Createbonus from "./components/bonus/Createbonus";
import Bonuslist from "./components/bonus/Bonuslist";
import PendingKYC from "./components/kyc/Pendingkyc";
import Verifiedkyc from "./components/kyc/Verifiedkyc";
import Allkyc from "./components/kyc/Allkyc";
import Rejectedkyc from "./components/kyc/Rejectedkyc";
import Weeklyandmonthlybonus from "./components/bonus/Weeklyandmonthlybonus";
import AutoPaymentMethod from "./components/autopaymentmethod/AutoPaymentMethod";
import HighlightGames from "./components/highlight/HighlightGames";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const admin = JSON.parse(localStorage.getItem("genzz_admin"));
  const token = localStorage.getItem("genzz_token");
  
  if (!admin || !token) {
    return <Navigate to="/admin-login" replace />;
  }

  return children ? children : <Outlet />;
};

// Public Only Route Component (for login page)
const PublicOnlyRoute = ({ children }) => {
  const admin = JSON.parse(localStorage.getItem("genzz_admin"));
  const token = localStorage.getItem("genzz_token");
  
  if (admin && token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Admin Layout Component (for pages with sidebar)
const AdminLayout = () => {
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const admin = JSON.parse(localStorage.getItem("genzz_admin"));
        const response = await axios.get(`${base_url}/auth/admin-info/${admin._id}`, {
          headers: {
            Authorization: `Bearer ${admin.token}`
          }
        });
        if (response.data.success) {
          setAdminInfo(response.data.data);
        } else {
          throw new Error(response.data.message || "Failed to fetch admin info");
        }
      } catch (err) {
        setError(err.message);
        // If there's an error (like unauthorized), clear local storage and redirect to login
        localStorage.removeItem("genzz_admin");
        window.location.href = "/admin-login";
      } finally {
        setLoading(false);
      }
    };

    fetchAdminInfo();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  if (!adminInfo) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="flex h-screen text-gray-100 overflow-hidden w-full">
      <Sidebar adminInfo={adminInfo} />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

function App() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/admin-login";

  return (
    <div className="flex h-screen text-gray-100 overflow-hidden">
      <Routes>
        {/* Public routes */}
        <Route path="/admin-login" element={
          <PublicOnlyRoute>
            <AdminLogin />
          </PublicOnlyRoute>
        } />

        {/* Protected routes with admin layout */}
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<OverviewPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          
          {/* Frontend */}
          <Route path="/add-banner" element={<Addbanner />} />
          <Route path="/banner-list" element={<Bannerlist />} />
          <Route path="/notice" element={<Notice />} />
          <Route path="/add-provider" element={<Addprovider />} />
          <Route path="/provider-list" element={<Providerlist />} />
          
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/games" element={<GamesTable />} />
          <Route path="/games/game-log" element={<Gamelogs />} />
          <Route path="/games/game-details" element={<Gamesdetails />} />
          
          {/* Game API */}
          <Route path="/game-api/add-new-game" element={<Newgame />} />
          <Route path="/game-api/all-games" element={<Allgames />} />
          <Route path="/game-api/new-category" element={<Newcategory />} />
          <Route path="/game-api/category-list" element={<Categorylist />} />
          <Route path="/game-api/highlight-games" element={<HighlightGames />} />

          {/* Users */}
          <Route path="/users/all-user" element={<Alluser />} />
          <Route path="/users/bet-history/:id" element={<Bethistory />} />
          <Route path="/users/send-notification" element={<NotificationPage />} />
          <Route path="/users/active-user" element={<Activeuser />} />
          <Route path="/users/inactive-user" element={<Inactiveuser />} />
          <Route path="/users/banned-user" element={<Banneduser />} />
          <Route path="/users/user-detail/:id" element={<UserDetail />} />
          <Route path="/users/banned-user-detail/:id" element={<Banneduserdetail />} />

          {/* Deposit */}
          <Route path="/deposits/failed-deposit" element={<Faileddeposit />} />
          <Route path="/deposits/successful-deposit" element={<Successdeposit />} />
          <Route path="/deposits/all-deposits" element={<Alldeposit />} />
          <Route path="/deposits/pending-deposit-details/:id" element={<DepositRequest />} />
          <Route path="/deposits/single-deposit-history/:id" element={<Singledeposithistory />} />
          
          {/* Withdraw */}
          <Route path="/withdraw/single-withdraw-history/:id" element={<SingleWithdrawHistory />} />
          <Route path="/withdraw/pending-withdraw-details/:id" element={<Withdrawdetails />} />
          <Route path="/withdrawals/pending-withdrawal" element={<Pendingwithdraw />} />
          <Route path="/withdrawals/success-withdrawal" element={<Successwithdraw />} />
          <Route path="/withdrawals/approved-withdrawal" element={<Approvedwithdraw />} />
          <Route path="/withdrawals/rejected-withdrawal" element={<Rejectedwithdraw />} />
          <Route path="/withdrawals/all-withdrawals" element={<Allwithdraw />} />
          
          {/* Report */}
          <Route path="/report/login/history" element={<Loginhistory />} />
          <Route path="/report/nptification/history" element={<Allnotifications />} />
          <Route path="/report/spin/history" element={<Spinhistory />} />
          
          {/* Moderator */}
          <Route path="/moderator/all-admins" element={<Alladmin />} />
          <Route path="/moderator/all-super-admins" element={<Superadmin />} />
          <Route path="/moderator/pending-admins" element={<Pendingadmin />} />
          <Route path="/moderator/create-user" element={<Createuser />} />
          {/* -----------------------bonus------------------------ */}
          <Route path="/deposit-bonus/create-bonus" element={<Createbonus />} />
          <Route path="/deposit-bonus/bonus-list" element={<Bonuslist />} />
          <Route path="/deposit-bonus/weekly-and-monthly-bonus" element={<Weeklyandmonthlybonus />} />


          
          {/* -----------------------bonus------------------------ */}

          {/* -----------------------kyc------------------------ */}
          <Route path="/kyc/pending-kyc" element={<PendingKYC />} />
          <Route path="/kyc/verified-kyc" element={<Verifiedkyc />} />
          <Route path="/kyc/rejected-kyc" element={<Rejectedkyc />} />
          <Route path="/kyc/kyc-history" element={<Allkyc />} />

          
          {/* -----------------------kyc------------------------ */}
          
          {/* Referal */}
          <Route path="/referal/add-referal" element={<Referal/>} />
          {/* -------------------security---------------- */}
          <Route path="/login-logs/all-login-logs" element={<Allloginlogs/>} />
          <Route path="/login-logs/failed-logins" element={<FailedLoginLogs/>} />
          <Route path="/login-logs/ip-whitelist" element={<Ipwhitelist/>} />
          <Route path="/login-logs/device-management" element={<Device/>} />
          <Route path="/login-logs/security-settings" element={<SecurityDashboard/>} />
          
          {/* -------------manage-list------------------ */}
          <Route path="/manage-list/auto-method" element={<AutoPaymentMethod />} />

          {/* Settings */}
          <Route path="/supports/pending-support" element={<Pendingticket />} />
          <Route path="/reports/transaction-history" element={<TransactionLogs />} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/request-reports" element={<Reportsandrequest />} />
          <Route path="/settings/general-settings" element={<Generalsettings />} />
          <Route path="/settings/logo-icon" element={<LogoFaviconUploader />} />
          <Route path="/settings/system-config" element={<Configuration />} />
          <Route path="/settings/seo-config" element={<SEOConfig />} />
          <Route path="/settings/notification" element={<NotificationTemplates />} />
          <Route path="/settings/robot-text" element={<RobotsTxtForm />} />
          <Route path="/admin/profile" element={<Profile />} />

        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Not found route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;