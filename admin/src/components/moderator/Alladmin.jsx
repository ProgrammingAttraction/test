import React,{useState} from 'react';
import { FaCheck, FaEdit, FaHeart, FaEye, FaEyeSlash } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import Header from '../common/Header';
import { RiComputerLine } from "react-icons/ri";
import { useEffect } from 'react';
import axios from "axios"
import moment from "moment"; // ✅ Import Moment.js
import toast, { Toaster } from 'react-hot-toast'; // Import react-hot-toast

const Alladmin = () => {
  function StatusSwitch({ status, onChange }) {
    const [isActive, setIsActive] = useState(status === "active");
  
    const handleToggle = () => {
      const newStatus = isActive ? "inactive" : "active";
      setIsActive(!isActive);
      onChange(newStatus);
    };
  
    return (
      <div className="flex items-center space-x-3 w-[130px]">
        {/* Square Toggle Switch */}
        <label className="inline-flex relative items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={isActive} onChange={handleToggle} />
          <div
            className={`w-12 h-6 bg-gray-300 dark:bg-gray-700 rounded-[2px] flex items-center px-1 transition-all duration-300 cursor-pointer peer-checked:bg-green-500`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-[2px] shadow-md transform transition-all duration-300 ${
                isActive ? "translate-x-[20px]" : "translate-x-0"
              }`}
            ></div>
          </div>
        </label>
              <span className={`text-sm font-medium ${isActive ? "text-green-600" : "text-gray-500"}`}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
    );
  }

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [active_users, set_activeusers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch all admins
  const active_user_info = () => {
    axios.get(`${base_url}/admin/all-admins`)
      .then((res) => {
        set_activeusers(res.data.data)
      }).catch((err) => {
        console.log(err)
        toast.error("Failed to load admins");
      })
  }

  useEffect(() => {
    active_user_info();
  }, [])

  const filterusers = active_users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle status change
  const handleStatusChange = (admin, status) => {
    axios.put(`${base_url}/admin/admin-status-update/${admin._id}`, {status: status})
      .then((res) => {
        toast.success(`You have updated account status to ${status}`);
        // Refresh the admin list
        active_user_info();
      }).catch((err) => {
        toast.error("Error", `${err.message}`, "error");
      })
  }

  // Open password change modal
  const openPasswordModal = (admin) => {
    setSelectedAdmin(admin);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordModal(true);
  }

  // Close password change modal
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setSelectedAdmin(null);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  }

  // Handle password input change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  // Validate password
  const validatePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("All fields are required");
      return false;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirmation do not match");
      return false;
    }

    return true;
  }

  // Handle password update
  const handleUpdatePassword = () => {
    if (!validatePassword()) return;
   console.log(passwordData)
    setLoading(true);
    
    axios.put(`${base_url}/admin/update-password/${selectedAdmin._id}`, passwordData, {
        headers: {
          'Authorization': localStorage.getItem('genzz_token')
        },
      })
      .then((res) => {
        toast.success("Password updated successfully");
        closePasswordModal();
      }).catch((err) => {
        console.error("Error updating password:", err);
        if (err.response?.data?.message) {
          toast.error(err.response.data.message);
        } else {
          toast.error("Failed to update password");
        }
      }).finally(() => {
        setLoading(false);
      })
  }

  return (
    <div className="w-full font-bai overflow-y-auto">
      <Header/>
      <Toaster/>
      
      {/* Password Update Modal */}
      {showPasswordModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Update Password for {selectedAdmin.name}
              </h2>
              <p className="text-gray-600 mb-6">Enter current password and set new password</p>
              
              {/* Current Password */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closePasswordModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePassword}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="p-4">
        <div className="p-6">
          <div className="w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold text-gray-800 mb-6">All Admins</h1>

              <div className="relative w-[30%]">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse shadow-xl bg-white  rounded-md overflow-hidden">
                <thead>
                  <tr className="bg-[#4634FF] text-white">
                    <th className="py-3 px-4 text-left">Admin</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">Role</th>
                    <th className="py-3 px-4 text-left">Joined At</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className='border-[1px] border-gray-200'>
                  {filterusers.map((admin, index) => (
                    <tr key={index} className="border-b even:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800">
                        <strong>{admin?.name}</strong>
                      </td>
                      <td className="py-3 px-4 text-gray-800">
                        <span>{admin.email}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-[600] capitalize">
                        {admin.role || 'admin'}
                      </td>
                      <td className="py-3 px-4 text-gray-800">
                        <span className='font-[600] text-[14px]'>{moment(admin?.createdAt).format("MMMM Do YYYY, h:mm A")}</span>
                        <br />
                        <span className="text-gray-600">
                          {moment(admin?.createdAt).fromNow()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusSwitch
                          status={admin.status}
                          onChange={(newStatus) => handleStatusChange(admin, newStatus)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {/* Password Update Button */}
                          <button 
                            onClick={() => openPasswordModal(admin)}
                            className="flex items-center border-[1px] border-green-500 px-[10px] py-[4px] rounded-[5px] text-green-500 hover:text-green-600 hover:bg-green-50"
                          >
                            <FaEdit className="mr-1" /> Update Password
                          </button>
                          
                          {/* Admin Details Button */}
                          {admin.status === "active" ? (
                            <NavLink to={`/users/user-detail/${admin._id}`}>
                              <button className="flex items-center border-[1px] border-blue-500 px-[10px] py-[4px] rounded-[5px] text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                <RiComputerLine className="mr-1" /> Details
                              </button>
                            </NavLink>
                          ) : (
                            <NavLink to={`/users/banned-user-detail/${admin._id}`}>
                              <button className="flex items-center border-[1px] border-blue-500 px-[10px] py-[4px] rounded-[5px] text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                <RiComputerLine className="mr-1" /> Details
                              </button>
                            </NavLink>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Alladmin;