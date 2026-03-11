import React, { useState, useEffect } from 'react';
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { MdDelete, MdImage, MdClose } from "react-icons/md";
import Header from '../../common/Header';

const Bannerlist = () => {
    const base_url = import.meta.env.VITE_API_KEY_Base_URL;
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);

    // Fetch banners (images) from API
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${base_url}/admin/banners`, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        'Authorization': localStorage.getItem('genzz_token')
                    },
                });
                setBanners(response.data.filenames || []);
            } catch (error) {
                console.error("Error fetching banners:", error);
                toast.error("Failed to load banners");
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    // Open delete confirmation modal
    const openDeleteModal = (imageName) => {
        setImageToDelete(imageName);
        setShowDeleteModal(true);
    };

    // Close delete confirmation modal
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setImageToDelete(null);
    };

    // Delete image function
    const handleDeleteImage = async () => {
        try {
            const response = await axios.delete(`${base_url}/admin/banners/${imageToDelete}`, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    'Authorization': localStorage.getItem('genzz_token')
                },
            });
            if (response.status === 200) {
                toast.success("Banner deleted successfully");
                setBanners((prevBanners) => prevBanners.filter((banner) => banner !== imageToDelete));
            }
        } catch (error) {
            toast.error("Error deleting banner");
            console.error("Error deleting banner:", error);
        } finally {
            closeDeleteModal();
        }
    };

    return (
        <section className='w-full font-bai min-h-screen'>
            <Header />
            <div className="w-full font-bai overflow-y-auto">
                <Toaster position="top-right" />
                <section className="p-6">
                    <div className="bg-white rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className='text-2xl font-semibold text-gray-800'>Banner Management</h1>
                            <span className="text-sm text-gray-500">
                                {banners.length} {banners.length === 1 ? 'banner' : 'banners'} total
                            </span>
                        </div>

                        {loading ? (
                 <div className="flex justify-center items-center h-64">
  <div className="relative">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
    <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-cyan-500/20 blur-sm"></div>
  </div>
</div>
                        ) : banners.length === 0 ? (
                            <div className="text-center py-12">
                                <MdImage className="mx-auto text-4xl text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No banners found</h3>
                                <p className="mt-1 text-sm text-gray-500">Upload some banners to get started.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto border-[1px] boreder-gray-200">
                                <table className="min-w-full divide-y divide-gray-200 ">
                                    <thead className="bg-blue-600 text-white">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium  uppercase tracking-wider">
                                                Preview
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider">
                                                Filename
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {banners.map((image, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex-shrink-0 h-16 w-16">
                                                        <img
                                                            src={`${base_url}/images/${image}`}
                                                            alt={`Banner ${index + 1}`}
                                                            className="h-16 w-16 object-cover rounded-md"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                        {image}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => openDeleteModal(image)}
                                                        className="text-white bg-red-500 px-[10px] py-[5px] rounded-[3px]  flex items-center space-x-1"
                                                    >
                                                        <MdDelete className="text-lg" />
                                                        <span>Delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-medium text-gray-900">Delete Banner</h3>
                                <button
                                    onClick={closeDeleteModal}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <MdClose className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete this banner? This action cannot be undone.
                                </p>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 "
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteImage}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 "
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Bannerlist;