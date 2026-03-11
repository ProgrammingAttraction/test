import React,{useState} from 'react';
import { FaCheck, FaEdit, FaHeart } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import Header from '../common/Header';
const GamesTable = () => {
  const games = [
    {
      name: "Treasure Hunt",
      minimumAmount: 5,
      maximumAmount: 100,
      status: "enabled",  // Game is enabled
    },
    {
      name: "Wheel of Fortune",
      minimumAmount: 10,
      maximumAmount: 200,
      status: "disabled",  // Game is disabled
    },
    {
      name: "Battle Royale",
      minimumAmount: 20,
      maximumAmount: 500,
      status: "enabled",  // Game is enabled
    },
    {
      name: "Lucky Draw",
      minimumAmount: 1,
      maximumAmount: 50,
      status: "enabled",  // Game is enabled
    },
    {
      name: "Poker Showdown",
      minimumAmount: 30,
      maximumAmount: 300,
      status: "disabled",  // Game is disabled
    },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const filtrgames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className=" w-full font-bai">
      <Header/>
          <section className="p-4  ">
            <div className="p-6">
              <div className="w-full  p-4">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Games</h1>
                <div className="flex justify-between items-center mb-4">
                  <div className="relative w-1/2">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <NavLink to="/add-payment-method">
                    <button className="bg-indigo-500 text-white px-4 py-2 rounded-[3px] hover:bg-indigo-600 focus:outline-none">
                      + Add New
                    </button>
                  </NavLink>
                </div>
                <table className="w-full border-collapse shadow-md font-bai border-[1px] border-[#eee] rounded-[5px] overflow-hidden">
                  <thead>
                    <tr className="bg-[#4634FF] text-white">
                      <th className="py-3 px-4 text-left">Game Name</th>
                      <th className="py-3 px-4 text-left">Minimum Invest</th>
                      <th className="py-3 px-4 text-left">Maximum Invest</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Action</th>

                    </tr>
                  </thead>
                  <tbody>
                    {filtrgames.map((game) => (
                      <tr key={game._id} className="border-b">
                        <td className="py-3 px-4 text-gray-800">{game.name}</td>
                        <td className="py-3 px-4 text-gray-800">৳ {game.minimumAmount}</td>
                        <td className="py-3 px-4 text-gray-800">৳ {game.maximumAmount}</td>

                        <td className="py-3 px-4">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                            {game.status || 'Enabled'} {/* Assuming 'status' field exists in your model */}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex items-center space-x-2">
                          <button
                            className="flex items-center border-[1px] border-blue-500 px-[10px] py-[4px] rounded-[5px] text-blue-500 hover:text-blue-600 focus:outline-none"
                          >
                            <AiOutlineEdit className="mr-1" /> Edit
                          </button>
                          <button
                          onClick={()=>{delete_method(game._id)}}
                            className="flex items-center text-red-500 hover:text-red-600 border border-red-600 px-[10px] py-[4px] rounded-[5px] focus:outline-none"
                          >
                            <AiOutlineDelete className="mr-1" /> Disable
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
    </div>
  );
};

export default GamesTable;