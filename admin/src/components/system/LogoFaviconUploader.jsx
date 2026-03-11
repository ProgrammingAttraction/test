import { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import Header from "../common/Header";

export default function LogoFaviconUploader() {
  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);

  // Handle File Upload
  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (file && (file.type.includes("png") || file.type.includes("jpeg") || file.type.includes("jpg"))) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === "logo") setLogo(reader.result);
        if (type === "favicon") setFavicon(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Invalid file type! Please upload a .png, .jpg, or .jpeg file.");
    }
  };

  return (
   <section className="w-full font-bai">
    <Header/>
    <div className="p-6 bg-gray-100 min-h-screen w-full flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-4">Logo & Favicon</h2>

      {/* Info Message */}
      <div className="bg-white border-l-[3px] border-indigo-600 text-indigo-800 p-3  w-full text-[16px] px-[10px] text-left">
      If the logo and favicon are not changed after you update from this page, please 
        <a href="#" className="text-blue-500 underline">clear the cache</a> from your browser. As we keep the filename the same after the update, it may show the old image for the cache. usually, it works after clear the cache but if you still see the old logo or favicon, it may be caused by server level or network level caching. Please clear them too.
      </div>

      {/* Upload Section */}
      <div className="bg-white shadow-md rounded-md p-6 mt-6 w-full">
        <div className="grid grid-cols-2 gap-6">
          
          {/* Logo Upload */}
          <div className=" py-4 rounded-md flex flex-col items-center justify-center relative w-full ">
            <h3 className="text-lg font-medium mb-2 absolute top-[-20px] left-0 text-gray-800">Logo</h3>
            <label htmlFor="logo-upload" className="relative w-full h-full cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md overflow-hidden">
              {logo ? (
                <img src={logo} alt="Logo Preview" className="w-full h-[180px] rounded-md object-cover" />
              ) : (
                <FaCloudUploadAlt className="text-blue-600 text-6xl" />
              )}
            </label>
            <input
              type="file"
              id="logo-upload"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              onChange={(e) => handleFileChange(e, "logo")}
            />
            <p className="text-[16px] text-gray-500 mt-[10px]">Supported Files: <b>.png, .jpg, .jpeg</b></p>
          </div>

          {/* Favicon Upload */}
          <div className=" py-4 rounded-md flex flex-col items-center justify-center relative w-full h-64">
            <h3 className="text-lg font-medium mb-2 absolute top-[-20px] left-0 text-gray-800">Favicon</h3>
            <label htmlFor="favicon-upload" className="relative w-full h-full cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md overflow-hidden">
              {favicon ? (
                <img src={favicon} alt="Favicon Preview" className="w-32 h-32 object-cover" />
              ) : (
                <FaCloudUploadAlt className="text-blue-600 text-6xl" />
              )}
            </label>
            <input
              type="file"
              id="favicon-upload"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              onChange={(e) => handleFileChange(e, "favicon")}
            />
            <p className="text-[16px] text-gray-500 mt-[10px]">Supported Files: <b>.png, .jpg, .jpeg</b></p>
          </div>

        </div>

        {/* Submit Button */}
        <button className="w-full bg-indigo-600 text-white py-3 rounded-md mt-6 hover:bg-indigo-700 transition">
          Submit
        </button>
      </div>
    </div>
   </section>
  );
}
