import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Header from '../common/Header';

const Profile = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const token = localStorage.getItem("genzz_token");
  const admin = JSON.parse(localStorage.getItem("genzz_admin"));
  
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${base_url}/admin/admin-info/${admin._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setAdminData(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch admin information");
        }
      } catch (err) {
        console.error("Error fetching admin info:", err);
        setError("An error occurred while fetching admin information");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminInfo();
  }, []);

  if (loading) {
    return (
      <section className="w-full font-bai text-gray-700 overflow-y-auto bg-gray-50 min-h-screen">
        <Header />
                 <div className="flex justify-center items-center h-64">
  <div className="relative">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
    <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-cyan-500/20 blur-sm"></div>
  </div>
</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full font-bai text-gray-700 overflow-y-auto bg-gray-50 min-h-screen">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full font-bai text-gray-700 overflow-y-auto bg-gray-50 min-h-screen">
      <Header />
      <div className="w-full p-4 md:p-6 mx-auto ">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Admin Profile</h1>
        </div>

        <div className="bg-white rounded-lg border-[1px] border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={adminData.name || ''}
                disabled
                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 text-gray-700 sm:text-sm h-10 border px-3"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={adminData.email || ''}
                disabled
                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 text-gray-700 sm:text-sm h-10 border px-3"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
              <input
                type="text"
                value={adminData._id || ''}
                disabled
                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 text-gray-700 sm:text-sm h-10 border px-3"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                value={adminData.role || ''}
                disabled
                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 text-gray-700 sm:text-sm h-10 border px-3"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <input
                type="text"
                value={adminData.status || ''}
                disabled
                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 text-gray-700 sm:text-sm h-10 border px-3"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
              <input
                type="text"
                value={adminData.created_by || 'System'}
                disabled
                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 text-gray-700 sm:text-sm h-10 border px-3"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <input
                type="text"
                value={new Date(adminData.createdAt).toLocaleString()}
                disabled
                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 text-gray-700 sm:text-sm h-10 border px-3"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
              <input
                type="text"
                value={new Date(adminData.updatedAt).toLocaleString()}
                disabled
                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 text-gray-700 sm:text-sm h-10 border px-3"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;