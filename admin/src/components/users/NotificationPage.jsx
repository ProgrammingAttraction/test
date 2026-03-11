import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { AiOutlineMail, AiOutlineSearch, AiOutlineClose } from "react-icons/ai";
import { FaChevronDown, FaPaperPlane } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import Header from "../common/Header";

export default function NotificationPage() {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("All Users");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${base_url}/admin/all-users`,{  headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }});
        setActiveUsers(res.data.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        toast.error("Failed to load users");
      }
    };
    fetchUsers();
  }, [base_url]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleSearch = (e) => setSearch(e.target.value);
  const handleSelect = (user) => {
    setSelectedUser(user);
    setIsOpen(false);
  };

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 10;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
      }
      setProgress(Math.min(currentProgress, 100));
    }, 300);
    return interval;
  };

  const handleSubmit = async () => {
    if (!selectedUser || !subject || !message) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);
    setShowProgress(true);
    setProgress(0);
    
    const progressInterval = simulateProgress();

    try {
      const response = await axios.post(`${base_url}/admin/send-notification`, {
        recipients: selectedUser,
        subject,
        message,
        sendViaEmail: true,
      },{  headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }});

      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setShowProgress(false);
        toast.success(response.data.message || "Notification sent successfully!");
        setMessage("");
        setSubject("");
        setSelectedUser("All Users");
        setLoading(false);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setShowProgress(false);
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Failed to send notification!"
      );
      console.error(error);
    }
  };

  const toolbarOptions = [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link", "image"],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ script: "sub" }, { script: "super" }],
    ["clean"],
  ];

  const FullScreenLoader = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl  mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[20px] font-bold text-gray-800">Sending Notification</h3>
          <button 
            onClick={() => {
              setShowProgress(false);
              setLoading(false);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <AiOutlineClose size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex space-x-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        <p className="text-gray-600 text-sm">
          {progress < 30 && "Preparing your notification..."}
          {progress >= 30 && progress < 70 && "Sending to recipients..."}
          {progress >= 70 && progress < 100 && "Finalizing delivery..."}
          {progress === 100 && "Notification sent successfully!"}
        </p>
      </div>
    </div>
  );

  return (
    <section className="min-h-screen bg-gray-50 font-bai">
      <Header />
      {showProgress && <FullScreenLoader />}
      <div className="container mx-auto py-8">
        <div className="w-full mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Send Notifications
            </h2>
            <div className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg">
              <AiOutlineMail className="text-xl" />
              <span className="font-medium">Email Notifications</span>
            </div>
          </div>

          <div className="bg-white rounded-[5px] shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="space-y-6">
                {/* Recipient Dropdown */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Recipients <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      onClick={toggleDropdown}
                      className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg bg-white flex justify-between items-center text-gray-700 hover:border-indigo-500 transition-colors"
                    >
                      <span className="truncate">{selectedUser}</span>
                      <FaChevronDown
                        className={`ml-2 text-gray-500 transition-transform ${
                          isOpen ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        <div className="relative p-2 border-b">
                          <AiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 text-sm text-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <ul className="max-h-60 overflow-y-auto">
                          <li
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer transition-colors"
                            onClick={() => handleSelect("All Users")}
                          >
                            <span className="font-medium">All Users</span>
                          </li>
                          {activeUsers
                            .filter((user) =>
                              user.email.toLowerCase().includes(search.toLowerCase())
                            )
                            .map((user, index) => (
                              <li
                                key={index}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer transition-colors"
                                onClick={() => handleSelect(user.email)}
                              >
                                {user.email}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subject Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter notification subject"
                    className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                {/* Message Editor */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      value={message}
                      onChange={setMessage}
                      className="h-64 text-gray-700 bg-white"
                      modules={{
                        toolbar: toolbarOptions,
                      }}
                      placeholder="Write your notification message here..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-[5px] font-medium transition-colors ${
                      loading
                        ? "bg-indigo-400 cursor-not-allowed"
                        : "bg-cyan-600 hover:bg-cyan-700"
                    } text-white shadow-sm`}
                  >
                    <FaPaperPlane />
                    <span>Send Notification</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}