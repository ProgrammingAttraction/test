import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Header from "../../common/Header";

const ProviderList = () => {
  const [providers, setProviders] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState(null);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Fetch Providers
  const fetchProviders = () => {
    axios
      .get(`${base_url}/admin/providers`)
      .then((res) => {
        setProviders(res.data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // Handle Delete Confirmation
  const confirmDelete = (provider) => {
    setProviderToDelete(provider);
    setShowDeleteModal(true);
  };

  // Handle Delete Provider
  const handleDelete = () => {
    if (!providerToDelete) return;
    
    axios
      .delete(`${base_url}/admin/provider-remove/${providerToDelete._id}`)
      .then(() => {
        setProviders((prev) => prev.filter((provider) => provider._id !== providerToDelete._id));
        toast.success("Provider deleted successfully!");
        setShowDeleteModal(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to delete provider.");
        setShowDeleteModal(false);
      });
  };

  return (
    <div className="w-full font-bai overflow-y-auto">
      <Header />
      <Toaster />
      <section className="p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Providers</h1>

        <div className="custom-scrollbar overflow-x-auto bg-white  ">
          <table className="w-full border-collapse border-[1px] border-gray-200 overflow-hidden">
            <thead>
              <tr className="bg-[#4634FF] text-white">
                <th className="p-3 text-left">Provider Name</th>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => (
                <tr key={provider._id} className="border-b even:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-700">{provider.providerName}</td>
                  <td className="p-3">
                    <img src={`${base_url}/images/${provider.imageUrl}`} alt={provider.providerName} className="w-16 h-16 object-cover rounded-lg" />
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => confirmDelete(provider)}
                      className="text-white bg-red-500 px-[10px] py-[5px] rounded-[3px]  flex items-center space-x-1 gap-2"
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {providers.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center text-gray-500 py-4">
                    No providers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 text-gray-700 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete <span className="font-bold">{providerToDelete?.providerName}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderList;