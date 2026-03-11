import React,{useState} from 'react';
import { FaCheck, FaEdit, FaHeart } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import Header from '../common/Header';
import { RiComputerLine } from "react-icons/ri";
import { useEffect } from 'react';
import axios from "axios"
import moment from "moment"; // ✅ Import Moment.js

const Allnotifications = () => {
  function StatusSwitch({ status, onChange }) {
    const [isActive, setIsActive] = useState(status === "active");
  
    const handleToggle = () => {
      const newStatus = isActive ? "inactive" : "active";
      setIsActive(!isActive);
      onChange(newStatus);
    };
  
    return (
      <div className="flex items-center space-x-3 w-[130px]">
        {/* Status Text */}
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

      const [active_users,set_activeusers]=useState([]);
      const active_user_info=()=>{
          axios.get(`${base_url}/admin/all-users`)
          .then((res)=>{
            set_activeusers(res.data.data)
          }).catch((err)=>{
            console.log(err)
          })
      }
      useEffect(()=>{
        active_user_info();
      },[])
  const [searchQuery, setSearchQuery] = useState('');
  const filterusers = active_users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className=" w-full font-bai">
      <Header/>
          <section className="p-4  ">
            <div className="p-6">
              <div className="w-full  p-4">
                <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Banned Users</h1>

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
      <table className="w-full border-collapse shadow-xl bg-white border-[1px] border-[#eee] rounded-md overflow-hidden">
        <thead>
          <tr className="bg-[#4634FF] text-white">
            <th className="py-3 px-4 text-left">User</th>
            <th className="py-3 px-4 text-left">Email-Mobile</th>
            <th className="py-3 px-4 text-left">Country</th>
            <th className="py-3 px-4 text-left">Joined At</th>
            <th className="py-3 px-4 text-left">Balance</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {filterusers.map((user, index) => (
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
                <span className="text-gray-600">  {moment(user?.createdAt).fromNow()}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-800 font-[600]">৳{user?.balance}</td>
              <td className="py-3 px-4 flex items-center space-x-2">
                <td className="py-3 px-4 flex items-center space-x-2">
                <StatusSwitch
                      status={user.status}
                      onChange={(newStatus) => handleStatusChange(data, newStatus)}
                    />
                </td>
                {
                  user.status=="active" ?   <NavLink to={`/users/user-detail/${user._id}`}>
                  <button className="flex items-center border-[1px] border-blue-500 px-[10px] py-[4px] rounded-[5px] text-blue-500 hover:text-blue-600">
                    <RiComputerLine className="mr-1" /> Details
                  </button>
                  </NavLink>:  <NavLink to={`/users/banned-user-detail/${user._id}`}>
                <button className="flex items-center border-[1px] border-blue-500 px-[10px] py-[4px] rounded-[5px] text-blue-500 hover:text-blue-600">
                  <RiComputerLine className="mr-1" /> Details
                </button>
                </NavLink>
                }
              
             
              </td> 
              {/* <td className="py-3 px-4 text-gray-800">{game.userSelect}</td>
              <td className="py-3 px-4 text-gray-800">
                {Array.isArray(game.result) ? game.result.join(", ") : game.result}
              </td>
              <td className="py-3 px-4 text-gray-800">{game.invest}</td>
              <td className="py-3 px-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    game.winOrFail === "Win"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {game.winOrFail}
                </span>
              </td>
              <td className="py-3 px-4 flex items-center space-x-2">
                <button className="flex items-center border-[1px] border-blue-500 px-[10px] py-[4px] rounded-[5px] text-blue-500 hover:text-blue-600">
                  <AiOutlineEdit className="mr-1" /> Edit
                </button>
                <button className="flex items-center text-red-500 hover:text-red-600 border border-red-600 px-[10px] py-[4px] rounded-[5px]">
                  <AiOutlineDelete className="mr-1" /> Disable
                </button>
              </td> */}
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

export default Allnotifications;