import { useState } from "react";
import { FaCloudUploadAlt, FaTrash } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import Header from "../../common/Header";

export default function AddProvider() {
  const [providerName, setProviderName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Handle Image Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove Selected Image
  const removeImage = () => {
    setImage(null);
    setImagePreview("");
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!providerName.trim()) {
      toast.error("Provider name is required!");
      return;
    }
    if (!image) {
      toast.error("Please upload an image!");
      return;
    }

    const formData = new FormData();
    formData.append("providerName", providerName);
    formData.append("image", image);

    try {
      await axios.post(`${base_url}/admin/add-provider`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          'Authorization': localStorage.getItem('genzz_token')
        }
      });

      toast.success("Provider added successfully!");
      setProviderName("");
      setImage(null);
      setImagePreview("");
    } catch (error) {
      console.error("Error uploading provider:", error);
      toast.error("Failed to add provider.");
    }
  };

  return (
    <section className="w-full font-bai overflow-y-auto min-h-[100vh] bg-gray-100">
      <Header />
      <div className="p-8 w-full flex flex-col items-center">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Add Provider</h2>

        {/* Form Container */}
        <div className="bg-white border border-gray-300 p-8 mt-6 w-full rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Provider Name Input */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Provider Name</label>
              <input
                type="text"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 text-gray-500 focus:ring-blue-500"
                placeholder="Enter provider name"
              />
            </div>

            {/* Image Upload - Clickable Box */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Upload Provider Image</label>
              <label
                htmlFor="file-upload"
                className="relative w-full border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition shadow-md p-6"
              >
                {imagePreview ? (
                  <div className="relative w-full flex flex-col items-center">
                    <img src={imagePreview} alt="Preview" className="w-full h-[200px] rounded-lg object-cover" />
                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-md hover:bg-red-700 transition"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <FaCloudUploadAlt className="text-blue-600 text-6xl mb-2" />
                    <span className="text-gray-700 font-medium">Click to Upload Image</span>
                  </>
                )}
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition text-lg font-semibold"
            >
              Add Provider
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
