import React, { useState } from "react";
import Header from "../common/Header";

const Referal = () => {
  const [levels, setLevels] = useState([
    { level: 1, percentage: 20 },
    { level: 2, percentage: 10 },
    { level: 3, percentage: 5 },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleGenerate = () => {
    const num = parseInt(inputValue);
    if (!isNaN(num) && num > 0) {
      const newLevels = Array.from({ length: num }, (_, i) => ({
        level: i + 1,
        percentage: (20 / (i + 1)).toFixed(2),
      }));
      setLevels(newLevels);
    }
  };

  return (
   <section className="w-full font-bai">
     <Header/>
     <div className="flex justify-center p-6 items-center ">
      <div className="bg-white shadow-md  w-full ">
        <div className="flex justify-between items-center bg-indigo-600 text-white p-3 rounded-t-lg">
          <h2 className="text-lg font-semibold">Deposit Referral Commission</h2>
          <button className="bg-red-500 text-white px-3 py-1 rounded">Disable Now</button>
        </div>
        <div className="p-4">
          {levels.map((item) => (
            <div key={item.level} className="flex justify-between py-2 text-gray-800 border-b">
              <span className="font-semibold ">Level {item.level}</span>
              <span>{item.percentage}%</span>
            </div>
          ))}
          <div className="text-center font-semibold pt-3 text-gray-800">Update Setting</div>
          <div className="">
            <label className="block text-gray-800">Number of Level</label>
            <input
              type="number"
              className="w-full p-2 border rounded mt-2"
              placeholder="Type a number & hit ENTER"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
            <button
              className="w-full bg-indigo-600 text-white p-2 rounded mt-3"
              onClick={handleGenerate}
            >
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
   </section>
  );
};

export default Referal;
