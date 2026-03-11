import { BarChart2, DollarSign, Menu, Settings, TrendingUp, Users, X } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link,NavLink } from "react-router-dom";
import { IoGameController, IoTicketOutline, IoBugOutline } from "react-icons/io5";
import { FaRegCreditCard } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import { TbReportAnalytics } from "react-icons/tb";
import { TbUserStar } from "react-icons/tb";
import axios from "axios";
import { CgController } from "react-icons/cg";
import { HiCode } from "react-icons/hi";
import { HiOutlineShare } from "react-icons/hi";
import logo from "../../assets/logo.png";
import {CgProfile } from "react-icons/cg";
import {IoLogOutOutline } from "react-icons/io5";
import { BiTransferAlt } from "react-icons/bi";
import { MdSecurity } from "react-icons/md";
import { GiGiftOfKnowledge } from "react-icons/gi"; // Importing a gift icon for bonus
import { MdLocalOffer } from "react-icons/md";
import { FcDocument } from "react-icons/fc"; // Added for KYC icon
import { MdOutlineListAlt,MdStar } from "react-icons/md"; // Added for Manage List menu
import { GiAutoRepair } from "react-icons/gi"; // Added for Auto Method submenu

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [countation_number, set_countation_number] = useState();
  const [pending_withdraw, set_pending_withdraw] = useState();
  const [approved_withdraw, set_approved_withdraw] = useState();
  const [rejected_withdraw, setrejected_withdraw] = useState();
  const [all_withdraw, set_allwithdraw] = useState();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  
  // ----------------deposit--------------------------
  const [pending_deposit, set_pending_deposit] = useState();
  const [success_deposit, set_success_deposit] = useState();
  const [all_deposit, set_all_deposit] = useState();
  
  // Fetch Pending Withdrawals
  const fetch_countation = () => {
    axios
      .get(`${base_url}/admin/all-coutation`)
      .then((res) => {
        set_pending_withdraw(res.data.pending_withdraw);
        set_approved_withdraw(res.data.approved_withdraw);
        setrejected_withdraw(res.data.rejected_withdraw);
        set_allwithdraw(res.data.all_withdraw);
        // ---------------------deposit---------------
        set_pending_deposit(res.data.pending_deposit);
        set_success_deposit(res.data.success_deposit);
        set_all_deposit(res.data.all_deposit);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetch_countation();
  }, []);

  const SIDEBAR_ITEMS = [
    {
      name: "Overview",
      icon: BarChart2,
      color: "#6366f1",
      href: "/dashboard",
    },
    {
      name: "Frontend",
      icon: HiCode,
      color: "#0fb9b1",
      submenu: [
        { name: "Banner", href: "/add-banner" },
        { name: "Banner List", href: "/banner-list" },
        { name: "Notice", href: "/notice" },
        { name: "Add Provider", href: "/add-provider" },
        { name: "Provider List", href: "/provider-list" },
      ],
    },
    {
      name: "Game Api",
      icon: IoGameController,
      color: "#8B5CF6",
      submenu: [
        { name: "New Category", href: "/game-api/new-category" },
        { name: "Category List", href: "/game-api/category-list" },
        { name: "New Game", href: "/game-api/add-new-game" },
        { name: "All Games", href: "/game-api/all-games" },
        { name: "Highlight Games", href: "/game-api/highlight-games", icon: MdStar }
      ],
    },
    {
      name: "Bet History",
      icon: IoGameController,
      color: "#8B5CF6",
      submenu: [
        { name: "Bet Log", href: "/games/game-log" },
      ],
    },
    {
      name: "Manage Users", 
      icon: Users, 
      color: "#EC4899", 
      href: "/users",
      submenu: [
        { name: "Active Users", href: "/users/active-user" },
        { name: "Inactive Users", href: "/users/inactive-user" },
        { name: "Banned Users", href: "/users/banned-user" },
        { name: "All Users", href: "/users/all-user" },
        { name: "Send Notification", href: "/users/send-notification" },
      ],
    },
    { 
      name: "Deposits", 
      icon: DollarSign, 
      color: "#10B981", 
      href: "/deposits",
      submenu: [
        { name: "Successful Deposits", href: "/deposits/successful-deposit", count: success_deposit },
        { name: "Failed Deposits", href: "/deposits/failed-deposit", count: pending_deposit },
        { name: "All Deposits", href: "/deposits/all-deposits", count: all_deposit },
      ] 
    },
    // Added Deposit Bonus Section here
    { 
      name: "Deposit Bonus", 
      icon: MdLocalOffer, 
      color: "#FF6B6B", 
      href: "/deposit-bonus",
      submenu: [
        { name: "Create Bonus", href: "/deposit-bonus/create-bonus" },
        { name: "Bonus List", href: "/deposit-bonus/bonus-list" },
        { name: "Weekly & Monthly Bonus", href: "/deposit-bonus/weekly-and-monthly-bonus" },
      ]
    },
    { 
      name: "Withdrawal", 
      icon: FaRegCreditCard, 
      color: "#F59E0B", 
      href: "/withdrwals",
      submenu: [
        { name: "Pending Withdrawals", href: "/withdrawals/pending-withdrawal", count: pending_withdraw },
        { name: "Approved Withdrawals", href: "/withdrawals/approved-withdrawal", count: approved_withdraw },
        { name: "Success Withdrawals", href: "/withdrawals/success-withdrawal" },
        { name: "Rejected Withdrawals", href: "/withdrawals/rejected-withdrawal", count: rejected_withdraw },
        { name: "All Withdrawals", href: "/withdrawals/all-withdrawals", count: all_withdraw },
      ]
    },
    // Added KYC Management Section
    { 
      name: "KYC Management", 
      icon: FcDocument, 
      color: "#4F46E5", // Using indigo color
      href: "/kyc",
      submenu: [
        { name: "KYC Hisotry", href: "/kyc/kyc-history" },
        { name: "Pending KYC", href: "/kyc/pending-kyc" },
        { name: "Verified KYC", href: "/kyc/verified-kyc" },
        { name: "Rejected KYC", href: "/kyc/rejected-kyc" },
      ]
    },
    // Added Manage List menu with Auto Method submenu
    { 
      name: "Manage List", 
      icon: MdOutlineListAlt, 
      color: "#FFA500", // Orange color
      href: "/manage-list",
      submenu: [
        { name: "Auto Method", href: "/manage-list/auto-method", icon: GiAutoRepair },
      ]
    },
    { 
      name: "Reports", 
      icon: TbReportAnalytics, 
      color: "#a55eea", 
      href: "/reports",
      submenu: [
        { name: "Spin History", href: "/report/spin/history" },
        { name: "Transaction History", href: "/reports/transaction-history" },
        { name: "Login History", href: "/report/login/history" },
        { name: "Notification History", href: "/report/nptification/history" },
      ]  
    },
    // { 
    //   name: "Security", 
    //   icon: MdSecurity, 
    //   color: "#fc5c65", 
    //   href: "/security",
    //   submenu: [
    //         { href: '/login-logs/all-login-logs', name: 'All Login Logs' },
    //         { href: '/login-logs/failed-logins', name: 'Failed Login Attempts' },
    //         { href: '/login-logs/ip-whitelist', name: 'IP Whitelist' },
    //         { href: '/login-logs/device-management', name: 'Device Management' },
    //         { href: '/login-logs/security-settings', name: 'Security Settings' },
    //   ]
      
    // },
    { 
      name: "Moderator", 
      icon: CgController, 
      color: "#fa8231", 
      href: "/moderator/all-admins",
      submenu: [
        { name: "Admin", href: "/moderator/all-admins" },
        { name: "Support", href: "/moderator/support" },
        // { name: "Super Admin", href: "/moderator/all-super-admins" },
        // { name: "Pending Role", href: "/moderator/pending-admins" },
        // { name: "Create User", href: "/moderator/create-user" },
      ]  
    },
    {
      name: "Referal",
      icon: HiOutlineShare,
      color: "#f7b731",
      submenu: [
        { name: "Add Referal", href: "/referal/add-referal" },
        { name: "Referal Logs", href: "/banner-list" },
      ],
    },
    { 
      name: "System Settings", 
      icon: Settings, 
      color: "#6EE7B7", 
      href: "/settings" 
    },
    { 
      name: "Reports & Request", 
      icon: IoBugOutline, 
      color: "#eb3b5a", 
      href: "/request-reports" 
    },
    {
      name: "My Profile",
      icon: CgProfile,
      color: "#778ca3",
      href: "/admin/profile"
    },
  ];

  const toggleSubmenu = (index) => {
    setOpenSubmenus((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
    <div className="hidden md:flex">
        <motion.div
            className={`relative z-10 transition-all overflow-y-auto overflow-x-hidden font-bai duration-300 ease-in-out flex-shrink-0 ${
                isSidebarOpen ? " md:w-[270px] lg:w-[300px] xl:w-[350px]" : "w-20"
            }`}
        >
            <div className='h-full overflow-y-auto bg-[#071251] overflow-x-hidden custom-scrollbar backdrop-blur-md p-4 flex flex-col border-r border-gray-700'>
                <div className='flex justify-start items-center'>
                    <div className="relative text-[30px] font-extrabold flex items-center">
                        <NavLink to="/dashboard">
                        <img className="w-[150px]" src={logo} alt="" />
                        </NavLink>
                    </div>
                </div>

                <nav className='mt-8 flex-grow'>
                    {SIDEBAR_ITEMS.map((item, index) => (
                        <div key={index}>
                            {item.submenu ? (
                                <div>
                                    <div
                                        onClick={() => toggleSubmenu(index)}
                                        className='flex items-center px-[10px] py-[10px] text-sm font-medium rounded-lg hover:bg-[#4634FF] transition-colors mb-2 cursor-pointer'
                                    >
                                        <item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
                                        <AnimatePresence>
                                            {isSidebarOpen && (
                                                <motion.span className='ml-4 whitespace-nowrap'>{item.name}</motion.span>
                                            )}
                                        </AnimatePresence>
                                        <motion.div
                                            className='ml-auto'
                                            animate={{ rotate: openSubmenus[index] ? 180 : 0 }}
                                        >
                                            <IoChevronDown size={16} />
                                        </motion.div>
                                    </div>
                                    <AnimatePresence>
  {openSubmenus[index] && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="ml-8"
    >
      {item.submenu.map((sub, subIndex) => (
        <Link
          key={subIndex}
          to={sub.href}
          className="flex justify-between items-center relative p-2 text-sm text-gray-400 hover:text-white"
        >
          <span className="flex items-center gap-2">
            {sub.icon && <sub.icon size={16} />}
            {sub.name}
          </span>
          {sub.count !== undefined && (
            <span className="bg-blue-500 absolute right-[4%] top-[2%] text-white text-xs font-bold px-2 py-1 rounded">
              {sub.count}
            </span>
          )}
        </Link>
      ))}
    </motion.div>
  )}
</AnimatePresence>

                                </div>
                            ) : (
                                <Link to={item.href} className='flex items-center text-sm p-2 font-medium rounded-lg hover:bg-[#4634FF] transition-colors mb-2'>
                                    <item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
                                    {isSidebarOpen && <span className='ml-4'>{item.name}</span>}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>
            </div>
        </motion.div>
    </div>
      {/* Mobile menu button - fixed position */}
   <div className="md:hidden">
   <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-[#071251] text-white md:hidden"
      >
        <Menu size={24} />
      </motion.button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed md:relative z-50 transition-all overflow-y-auto overflow-x-hidden font-bai duration-300 ease-in-out flex-shrink-0 h-full ${
          isSidebarOpen ? "w-[270px] md:w-[270px] lg:w-[300px] xl:w-[350px]" : "w-0 md:w-20"
        }`}
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : -270 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <div className='h-full overflow-y-auto bg-[#071251] overflow-x-hidden custom-scrollbar backdrop-blur-md p-4 flex flex-col border-r border-gray-700'>
          <div className='flex justify-between items-center'>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className='p-[10px] rounded-full hover:bg-[#4634FF] transition-colors max-w-fit'
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='py-4 px-4 sm:px-6 lg:px-8'
                >
                  <div className="relative text-[30px] font-extrabold flex items-center tracking-wide">
                    <img src={logo} alt="" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <nav className='mt-8 flex-grow'>
            {SIDEBAR_ITEMS.map((item, index) => (
              <div key={index}>
                {item.submenu ? (
                  <div>
                    <div
                      onClick={() => toggleSubmenu(index)}
                      className='flex items-center px-[10px] py-[10px] text-sm font-medium rounded-lg hover:bg-[#4634FF] transition-colors mb-2 cursor-pointer'
                    >
                      <item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
                      <AnimatePresence>
                        {isSidebarOpen && (
                          <motion.span 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='ml-4 whitespace-nowrap'
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <AnimatePresence>
                        {isSidebarOpen && (
                          <motion.div
                            className='ml-auto'
                            animate={{ rotate: openSubmenus[index] ? 180 : 0 }}
                          >
                            <IoChevronDown size={16} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <AnimatePresence>
                      {openSubmenus[index] && isSidebarOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-8"
                        >
                          {item.submenu.map((sub, subIndex) => (
                            <Link
                              key={subIndex}
                              to={sub.href}
                              onClick={closeSidebar}
                              className="flex justify-between items-center relative p-2 text-sm text-gray-400 hover:text-white"
                            >
                              <span className="flex items-center gap-2">
                                {sub.icon && <sub.icon size={16} />}
                                {sub.name}
                              </span>
                              {sub.count !== undefined && (
                                <span className="bg-blue-500 absolute right-[4%] top-[2%] text-white text-xs font-bold px-2 py-1 rounded">
                                  {sub.count}
                                </span>
                              )}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link 
                    to={item.href} 
                    onClick={closeSidebar}
                    className='flex items-center text-sm p-2 font-medium rounded-lg hover:bg-[#4634FF] transition-colors mb-2'
                  >
                    <item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
                    <AnimatePresence>
                      {isSidebarOpen && (
                        <motion.span 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className='ml-4'
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </motion.div>
   </div>
    </>
  );
};

export default Sidebar;