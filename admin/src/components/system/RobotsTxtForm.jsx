import React from "react";
import Header from "../common/Header";

const RobotsTxtForm = () => {
  return (
    <section className="w-full font-bai">
        <Header/>
        <div className="w-full p-[20px] min-h-screen bg-gray-100">
      <div className="w-full  p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Robots TXT</h2>
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Insert Robots txt
          </label>
          <textarea
            className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Insert Robots.txt here..."
          ></textarea>
        </div>
        <button className="w-full mt-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
          Submit
        </button>
      </div>
    </div>
    </section>
  );
};

export default RobotsTxtForm;
