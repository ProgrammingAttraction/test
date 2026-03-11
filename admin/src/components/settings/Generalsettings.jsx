import React from "react";
import { FaGlobe, FaMoneyBillWave, FaPalette, FaList, FaGift, FaClock } from "react-icons/fa";
import Header from "../common/Header";

const Generalsettings = () => {
  return (
    <section className="w-full font-bai">
        <Header/>
        <div className="p-6  w-full flex justify-center">
      <div className="w-full">
        <h2 className="text-[25px] text-black font-semibold mb-4">General Setting</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-800">Site Title *</label>
            <div className="flex items-center border border-gray-300 p-2 mt-1 rounded-md w-full">
              <FaGlobe className="mr-2 text-gray-500" />
              <input type="text" className="w-full outline-none text-gray-900" placeholder="Xaxino" />
            </div>
          </div>
          <div>
            <label className="block font-medium text-gray-800">Currency *</label>
            <div className="flex items-center border border-gray-300 mt-1 p-2 rounded-md w-full">
              <FaMoneyBillWave className="mr-2 text-gray-500" />
              <input type="text" className="w-full outline-none text-gray-900" placeholder="USD" />
            </div>
          </div>
          <div>
            <label className="block font-medium text-gray-800">Timezone *</label>
            <div className="flex items-center border border-gray-300 p-2 rounded-md w-full">
              <FaClock className="mr-2 text-gray-500" />
              <select className="w-full outline-none text-gray-800">
                <option>UTC</option>
                <option>PST</option>
                <option>EST</option>
                <option>CET</option>
                <option>IST</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium text-gray-800">Currency Symbol *</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded-md outline-none" placeholder="$" />
          </div>
          <div>
            <label className="block font-medium text-gray-800">Site Base Color *</label>
            <div className="flex items-center border border-gray-300 p-2 rounded-md w-full">
              <FaPalette className="mr-2 text-gray-500" />
              <input type="text" className="w-full outline-none text-gray-800" placeholder="#E3BC3F" />
              <input type="color" className="ml-2 w-10 h-10" defaultValue="#E3BC3F" />
            </div>
          </div>
          <div>
            <label className="block font-medium text-gray-800">Site Secondary Color *</label>
            <div className="flex items-center border border-gray-300 text-gray-800 p-2 rounded-md w-full">
              <FaPalette className="mr-2 text-gray-500" />
              <input type="text" className="w-full outline-none" placeholder="#000000" />
              <input type="color" className="ml-2 w-10 h-10 " defaultValue="#000000" />
            </div>
          </div>
          <div>
            <label className="block font-medium text-gray-800">Records to Display Per Page</label>
            <div className="flex items-center border text-gray-800 border-gray-300 p-2 rounded-md w-full">
              <FaList className="mr-2 text-gray-500" />
              <select className="w-full outline-none">
                <option>20 items per page</option>
                <option>50 items per page</option>
                <option>100 items per page</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium text-gray-800">Currency Showing Format *</label>
            <select className="w-full border border-gray-300 p-2 text-gray-800 rounded-md outline-none">
              <option>Show Currency Text and Symbol Both</option>
              <option>Show Currency Text Only</option>
              <option>Show Currency Symbol Only</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-gray-800">Register Bonus *</label>
            <div className="flex items-center border border-gray-300 p-2 rounded-md w-full">
              <FaGift className="mr-2 text-gray-800" />
              <input type="number" className="w-full outline-none" placeholder="10" />
              <span className="ml-2  text-gray-800">USD</span>
            </div>
          </div>
        </div>
        <button className="w-full mt-4 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">
          Submit
        </button>
      </div>
    </div>
    </section>
  );
};

export default Generalsettings;
