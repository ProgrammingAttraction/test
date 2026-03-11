import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import moment from "moment";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import Header from "../components/common/Header";

const Allnotifications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("email") || "");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Function to fetch notifications
  const fetchNotifications = () => {
    setLoading(true);

    axios
      .get(`${base_url}/admin/notification-history`, {
        params: {
          email: searchQuery || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      })
      .then((res) => {
        setNotifications(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching notifications:", err);
      })
      .finally(() => setLoading(false));
  };

  // Fetch data when searchParams change
  useEffect(() => {
    fetchNotifications();
  }, [searchParams]);

  // Handle Search
  const handleSearch = () => {
    setSearchParams({
      email: searchQuery || "",
      startDate: startDate || "",
      endDate: endDate || "",
    });
  };

  // Clear Search Filters
  const clearSearch = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setSearchParams({}); // Reset URL params
  };

  return (
    <div className="w-full font-bai overflow-y-auto">
      <Header />
      <section className="">
        <div className="p-6">
          {/* Search Bar */}
          <div className="flex gap-3 mb-6 justify-end items-center text-gray-800">
            {/* Email Search */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-64">
              <input
                type="text"
                placeholder="Search Email"
                className="w-full px-4 py-2 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={handleSearch}
                className="bg-cyan-600 p-3 text-white flex items-center justify-center"
              >
                <FiSearch size={18} />
              </button>
            </div>

            {/* Date Range Pickers */}
            <div className="flex items-center gap-4">
              <input
                type="date"
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <button
                onClick={handleSearch}
                className="bg-cyan-600 px-4 py-2 text-white rounded-md"
              >
                Search
              </button>
              <button
                onClick={clearSearch}
                className="bg-gray-500 px-4 py-2 text-white rounded-md"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-gray-600 text-center mt-4">Loading...</p>
            ) : (
              <table className="w-full border-collapse shadow-xl bg-white border-[1px] border-[#eee] overflow-hidden">
                <thead>
                  <tr className="bg-cyan-600 text-white">
                    <th className="py-3 px-4 text-left">Recipients</th>
                    <th className="py-3 px-4 text-left">Subject</th>
                    <th className="py-3 px-4 text-left">Sent Via Email</th>
                    <th className="py-3 px-4 text-left">Created At</th>
                    <th className="py-3 px-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <tr key={index} className="border-b even:bg-gray-50">
                        <td className="py-3 px-4 text-gray-800">
                          {notification.recipients.length > 1
                            ? "All Users"
                            : notification.recipients[0]}
                        </td>
                        <td className="py-3 px-4 text-gray-800">{notification.subject}</td>
                        <td className="py-3 px-4 text-gray-800">
                          {notification.sentViaEmail ? "Yes" : "No"}
                        </td>
                        <td className="py-3 px-4 text-gray-800">
                          <span className="font-[600] text-[14px]">
                            {moment(notification.createdAt).format("MMMM Do YYYY, h:mm A")}
                          </span>
                          <br />
                          <span className="text-gray-600">
                            {moment(notification.createdAt).fromNow()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedNotification(notification)}
                            className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-gray-600 py-4">
                        No notifications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* Popup */}
      {selectedNotification && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[400px]">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Notification Details</h2>
            <p className="text-gray-700 mb-4">
              <strong>Subject:</strong> {selectedNotification.subject}
            </p>
            <div
              className="border p-4 rounded-md bg-gray-100 text-gray-800"
              dangerouslySetInnerHTML={{ __html: selectedNotification.message }}
            ></div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedNotification(null)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allnotifications;
