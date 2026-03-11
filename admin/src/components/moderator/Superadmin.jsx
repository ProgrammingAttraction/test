import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { RiComputerLine } from 'react-icons/ri';
import axios from "axios";
import moment from "moment";
import Header from '../common/Header';
import { NavLink } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast'; // Import react-hot-toast

const Superadmin = () => {
  function StatusSwitch({ status, onChange }) {
    const [isActive, setIsActive] = useState(status === "active");

    const handleToggle = () => {
      const newStatus = isActive ? "inactive" : "active";
      setIsActive(!isActive);
      onChange(newStatus);
    };

    return (
      <div className="flex items-center space-x-3 w-[130px]">
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

  const [activeUsers, setActiveUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', mobile: '', password: '', role: 'super-admin' });

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    axios.get(`${base_url}/admin/all-super-admins`)
      .then((res) => setActiveUsers(res.data.data))
      .catch((err) => console.log(err));
  }, []);

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleChange = (e) => setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newAdmin.name || !newAdmin.email || !newAdmin.mobile || !newAdmin.password) {
      return toast.error("All fields are required!");
    }

    axios.post(`${base_url}/auth/admin-registration`, newAdmin)
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message);
          setIsModalOpen(false);
          setNewAdmin({ name: '', email: '', mobile: '', password: '', role: 'Super Admin' });
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(err => {
        console.log(err);
        toast.error("Something went wrong. Please try again.");
      });
  };

  const filterUsers = activeUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleStatusChange=(e,status)=>{
    console.log(status)
    axios.put(`${base_url}/admin/admin-status-update/${e._id}`,{status:status})
    .then((res)=>{
      if(res){
        toast.success(`You have updated acocunt stutus to ${status}`)
      }
    }).catch((err)=>{
      toast.error("Error", `${err.message}`, "error");
    })
  }
  return (
    <div className="w-full font-bai overflow-y-auto">
      <Header />
      <Toaster/>

      <section className="p-4">
        <div className="p-6">
          <div className="w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold text-gray-800">Super Admins</h1>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={toggleModal}>Add Super Admin</button>
            </div>
            <table className="w-full border-collapse bg-white border-[1px] border-[#eee] rounded-md overflow-hidden">
              <thead>
                <tr className="bg-[#4634FF] text-white">
                  <th className="py-3 px-4 text-left">User</th>
                  <th className="py-3 px-4 text-left">Email-Mobile</th>
                  <th className="py-3 px-4 text-left">Country</th>
                  <th className="py-3 px-4 text-left">Joined At</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filterUsers.map((user, index) => (
                  <tr key={index} className="border-b even:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800">
                      <strong>{user?.name}</strong>
                      <br />
                      <span className="text-gray-600">{user.username}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-800">
                      <span>{user.email}</span>
                      <br />
                      <span className="text-gray-600">{user.mobile}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-800 font-[600]">Bangladesh</td>
                    <td className="py-3 px-4 text-gray-800">
                      <span className='font-[600] text-[14px]'>{moment(user?.createdAt).format("MMMM Do YYYY, h:mm A")}</span>
                      <br />
                      <span className="text-gray-600">{moment(user?.createdAt).fromNow()}</span>
                    </td>
                    <td className="py-3 px-4">
                    <StatusSwitch
                      status={user.status}
                      onChange={(newStatus) => handleStatusChange(data, newStatus)}
                    />
                    </td>
                    <td>
                      <NavLink to={`/users/${user.status === "active" ? "user-detail" : "banned-user-detail"}/${user._id}`}>
                        <button className="flex items-center border-[1px] border-blue-500 px-[10px] py-[4px] rounded-[5px] text-blue-500 hover:text-blue-600">
                          <RiComputerLine className="mr-1" /> Details
                        </button>
                      </NavLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Add Super Admin</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" placeholder="Name" value={newAdmin.name} onChange={handleChange} className="w-full p-2 border outline-blue-600 text-gray-700" required />
              <input type="text" name="email" placeholder="Email" value={newAdmin.email} onChange={handleChange} className="w-full p-2 border outline-blue-600 text-gray-700" required />
              <input type="text" name="mobile" placeholder="Mobile" value={newAdmin.mobile} onChange={handleChange} className="w-full p-2 border outline-blue-600 text-gray-700" required />
              <input type="password" name="password" placeholder="Password" value={newAdmin.password} onChange={handleChange} className="w-full p-2 border outline-blue-600 text-gray-700" required />
              <button onClick={toggleModal} className="px-4 py-2  bg-gray-200 text-gray-800 rounded-md">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 ml-[10px] text-white rounded-md">Add</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Superadmin;
