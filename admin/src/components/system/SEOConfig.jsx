import { useState } from "react";
import { FiUpload } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import Header from "../common/Header";

export default function SEOConfig() {
  const [image, setImage] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [socialTitle, setSocialTitle] = useState("");
  const [socialDescription, setSocialDescription] = useState("");

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleKeywordKeyDown = (event) => {
    if (event.key === "Enter" && keywordInput.trim() !== "") {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
      event.preventDefault();
    }
  };

  const removeKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const formData = {
      image,
      keywords,
      metaDescription,
      socialTitle,
      socialDescription,
    };
    console.log("Form Submitted", formData);
  };

  return (
 <section className="w-full font-bai">
    <Header/>
    <div className="p-6 bg-gray-100 w-full min-h-screen ">
    <h2 className="text-xl font-semibold mb-4 text-gray-800">SEO Configuration</h2>

      <div className="bg-white shadow-md p-6 rounded-lg w-full flex">
        {/* Left Section - Image Upload */}
        <div className="w-1/2 pr-4">
          <label className="block font-medium mb-2 text-gray-700">SEO Image</label>
          <div className=" rounded-lg relative">
            {image ? (
              <img src={image} alt="Preview" className="w-full h-60 object-cover rounded-md" />
            ) : (
              <div className="w-full h-60 flex items-center justify-center border-dashed border-gray-300 border-2 rounded-md text-gray-500">
                No Image Selected
              </div>
            )}
            <input type="file" className="hidden" id="upload" onChange={handleImageUpload} />
            <label htmlFor="upload" className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer">
              <FiUpload size={20} />
            </label>
          </div>
        </div>

        {/* Right Section - Form Fields */}
        <div className="w-1/2 pl-4">
          <div>
            <label className="block font-medium mb-1 text-gray-700">Meta Keywords</label>
            <div className="flex flex-wrap gap-2 border p-3 rounded-[5px]">
              {keywords.map((keyword, index) => (
                <span key={index} className="bg-blue-500 text-white px-2 py-1 rounded-[4px] flex items-center">
                  {keyword}
                  <IoClose className="ml-2 cursor-pointer" onClick={() => removeKeyword(index)} />
                </span>
              ))}
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                placeholder="Type a keyword and press Enter"
                className="flex-grow outline-none text-gray-700"
              />
            </div>
          </div>
          <div className="mt-2">
            <label className="block font-medium mb-1 text-gray-700">Meta Description</label>
            <textarea
              className="w-full p-2 border rounded-[5px] text-gray-700"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
            />
          </div>
          <div className="mt-2">
            <label className="block font-medium mb-1 text-gray-700">Social Title</label>
            <input
              type="text"
              className="w-full p-2 border rounded-[5px] text-gray-700"
              value={socialTitle}
              onChange={(e) => setSocialTitle(e.target.value)}
            />
          </div>
          <div className="mt-2">
            <label className="block font-medium mb-1 text-gray-700">Social Description</label>
            <textarea
              className="w-full p-2 border rounded-[5px] text-gray-700"
              value={socialDescription}
              onChange={(e) => setSocialDescription(e.target.value)}
            />
          </div>
          <button
            onClick={handleSubmit}
            className="mt-3 w-full bg-blue-600 text-white py-2 rounded-[5px] hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
 </section>
  );
}
