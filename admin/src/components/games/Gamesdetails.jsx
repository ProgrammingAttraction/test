import { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Header from "../common/Header";

const Gamesdetails = () => {
  const [gameName, setGameName] = useState("Crazy Times");
  const [image, setImage] = useState(null);
  const [minInvest, setMinInvest] = useState(10);
  const [maxInvest, setMaxInvest] = useState(100);
  const [winChance, setWinChance] = useState(50);
  const [description, setDescription] = useState("");
  const [trending, setTrending] = useState(false);
  const [featured, setFeatured] = useState(false);

  const handleSubmit = () => {
    console.log({ description, trending, featured });
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <section className="w-full overflow-y-auto font-bai">
            <Header/>
            <div className="p-6">
      <div className=" p-6 rounded-lg border-[1px] border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Update Crazy Times</h2>
          <button className="flex items-center text-gray-800 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">
            <IoArrowBack className="mr-2" /> Back
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Game Name *</label>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4 text-gray-700"
            />
            <label className="block text-gray-700 font-medium mb-1">Image</label>
            <div className="border rounded-lg p-4 flex items-center justify-center relative h-52 bg-gray-50">
              {image ? (
                <img src={image} alt="Uploaded" className="h-full" />
              ) : (
                <FaCloudUploadAlt className="text-4xl text-gray-800" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-sm text-gray-800 mt-2">
              Supported Files: .png, .jpg, .jpeg. Image will be resized into 800x800px
            </p>
          </div>
          <div>
            <div className="bg-indigo-600 text-white p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold">Bet Amount & Number</h3>
              <label className="block mt-2">Minimum Invest Amount *</label>
              <div className="flex items-center border rounded-lg bg-white p-2 text-black mt-1">
                <input
                  type="number"
                  value={minInvest}
                  onChange={(e) => setMinInvest(e.target.value)}
                  className="w-full outline-none"
                />
                <span className="ml-2 text-gray-700">USD</span>
              </div>
              <label className="block mt-2">Maximum Invest Amount *</label>
              <div className="flex items-center border rounded-lg bg-white p-2 text-black mt-1">
                <input
                  type="number"
                  value={maxInvest}
                  onChange={(e) => setMaxInvest(e.target.value)}
                  className="w-full outline-none"
                />
                <span className="ml-2 text-gray-700">USD</span>
              </div>
            </div>
            <div className="bg-indigo-600 text-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold">Win Chance</h3>
              <label className="block mt-2">Winning Chance</label>
              <div className="flex items-center border rounded-lg bg-white p-2 text-black mt-1">
                <input
                  type="number"
                  value={winChance}
                  onChange={(e) => setWinChance(e.target.value)}
                  className="w-full outline-none"
                />
                <span className="ml-2 text-gray-700">%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Win Bonus</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="">
              <table className="w-full text-left rounded-t-[5px] overflow-hidden">
                <thead className="bg-blue-600">
                  <tr>
                    <th className="px-[10px] py-[10px]">Invest Number</th>
                    <th>Wheel Segments</th>
                    <th>Odds</th>
                    <th>Winnings (based on a $5 invest)</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-black">
                  <tr><td className="px-[10px] py-[6px]">1</td><td className="px-[10px] py-[6px]">21</td><td className="px-[10px] py-[6px]">1:1</td><td className="px-[10px] py-[6px]">$10</td></tr>
                  <tr><td className="px-[10px] py-[6px]">1</td><td className="px-[10px] py-[6px]">21</td><td className="px-[10px] py-[6px]">1:1</td><td className="px-[10px] py-[6px]">$10</td></tr>
                  <tr><td className="px-[10px] py-[6px]">1</td><td className="px-[10px] py-[6px]">21</td><td className="px-[10px] py-[6px]">1:1</td><td className="px-[10px] py-[6px]">$10</td></tr>
          
                </tbody>
              </table>
            </div>
            <div className="bg-indigo-600 text-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold">More Win Ratio</h3>
              <div className="space-y-2 mt-2">
                {[
                  { label: "Coin Flip", value: 30 },
                  { label: "Pachinko", value: 40 },
                  { label: "Cash Hunt", value: 50 },
                  { label: "Crazy Times", value: 60 },
                ].map((item, index) => (
                  <div key={index} className="flex items-center border rounded-lg bg-white p-2 text-black">
                    <span className="w-1/2">{item.label}</span>
                    <input type="number" value={item.value} className="w-full outline-none" />
                    <span className="ml-2 text-gray-700">%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full mt-[20px]">
      <div className="bg-blue-700 text-white text-lg font-bold p-2 rounded-t-md">
        Game Instruction
      </div>
      <div className="p-4 bg-white border border-gray-200 pb-[80px]">
        <ReactQuill value={description} onChange={setDescription} className="h-40 mb-4" />
      </div>
      <div className="bg-blue-700 text-white text-lg font-bold p-2 mt-4 rounded-t-md">
        For App
      </div>
      <div className="p-4 bg-white w-full border border-gray-200 flex justify-between  gap-[10px] items-center">
        <div className="flex flex-col w-[50%]">
          <span className="text-gray-600 text-left">Trending</span>
          <button
            className={`w-full py-2 mt-2 text-white font-bold rounded ${trending ? "bg-green-500" : "bg-red-500"}`}
            onClick={() => setTrending(!trending)}
          >
            {trending ? "Yes" : "No"}
          </button>
        </div>
        <div className="flex flex-col w-[50%]">
          <span className="text-gray-600 text-right">Featured</span>
          <button
            className={`w-full py-2 mt-2 text-white font-bold rounded ${featured ? "bg-green-500" : "bg-red-500"}`}
            onClick={() => setFeatured(!featured)}
          >
            {featured ? "Yes" : "No"}
          </button>
        </div>
      </div>
      <button
        className="w-full bg-blue-700 text-white font-bold py-2 mt-4 rounded"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
      </div>
    </div>
    </section>
  );
};

export default Gamesdetails;