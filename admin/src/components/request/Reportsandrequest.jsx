import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { RiComputerLine } from "react-icons/ri";
import Header from '../common/Header';
import { LuBug } from "react-icons/lu";
import { BiSupport } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
const Reportsandrequest = () => {
    const [modalVisible, setModalVisible] = useState(false);
  return (
    <div className="w-full font-bai">
      <Header />
      <section className="p-4">
        <div className="p-6">
          <div className="w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold text-gray-800 mb-6">Your Listed Report & Request</h1>
               <div className='flex justify-center items-center gap-[10px]'>
               <div className="flex justify-center items-center ">
      {/* Report a bug button */}
      <button
        className="px-4 py-2 border border-orange-400 text-orange-400 rounded-md flex items-center gap-2 hover:bg-orange-50 transition"
        onClick={() => setModalVisible(true)}
      >
        <LuBug />
        <span>Report a bug</span>
      </button>

      {/* Modal Overlay */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          {/* Modal */}
          <div className="bg-white w-[400px] rounded-lg shadow-lg p-6 relative transition-all scale-100 animate-fadeIn">
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
              onClick={() => setModalVisible(false)}
            >
              <IoClose size={20} />
            </button>

            {/* Modal Content */}
            <h2 className="text-lg text-gray-700 font-semibold mb-4">Report & Request</h2>
            
            {/* Type Select */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800">Type *</label>
              <select className="w-full mt-1 px-3 py-2 border rounded-md text-gray-700 focus:outline-indigo-500">
                <option>Report Bug</option>
                <option>Feature Request</option>
              </select>
            </div>

            {/* Message Textarea */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800">Message *</label>
              <textarea className="w-full mt-1 px-3 py-2 border rounded-md text-gray-700 focus:outline-indigo-500" rows="4"></textarea>
            </div>

            {/* Submit Button */}
            <button className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
                <button className='px-[14px] py-[7px] border-[1px] border-green-400 text-green-400 rounded-[5px] flex justify-center items-center gap-[8px]'>
                <BiSupport/>
                <span>Request for support</span>
                </button>
               </div>
            </div>
            <div className="overflow-x-auto shadow-sm border-[1px] border-[#eee]">
              <table className="w-full border-collapse shadow-xl bg-white border-[1px] border-[#eee] rounded-md overflow-hidden">
                <thead>
                  <tr className="bg-[#4634FF] text-white">
                    <th className="py-3 px-4 text-left">Type</th>
                    <th className="py-3 px-4 text-left">Message</th>
                    <th className="py-3 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className='bg-white p-[10px] text-gray-800 flex justify-center items-center text-[16px] font-[600]'>
                        Data not found
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reportsandrequest;
