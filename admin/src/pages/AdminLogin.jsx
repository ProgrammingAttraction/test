import axios from "axios";
import { useState } from "react";
import { FaUser, FaLock, FaSpinner } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";
import toast, { Toaster } from 'react-hot-toast';
import logo from "../assets/logo.png";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${base_url}/auth/admin-login`, formData);
      
      if (response.data.success) {
        toast.success(response.data.message);
        localStorage.setItem("genzz_token", response.data.jwtToken);
        localStorage.setItem("genzz_admin", JSON.stringify(response.data.admin));
        // Add a small delay before redirecting to allow toast to show
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        if (err.response.status === 401) {
          toast.error("Invalid credentials. Please try again.");
        } else {
          toast.error("An error occurred. Please try again later.");
        }
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen font-bai bg-gray-900 w-full relative overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 opacity-80">
          <motion.div 
            className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-600/20 to-pink-500/20 clip-path-custom"
          animate={{ opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1F2937',
            color: '#fff',
            border: '1px solid #374151',
            borderRadius: '0.5rem',
            padding: '1rem',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md p-8 space-y-3 bg-gray-800/80 backdrop-blur-lg rounded-xl border border-gray-700/50 shadow-2xl mx-4"
      >
        <div className='flex justify-center items-center'>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <img 
              className="w-[50%] m-auto block" 
              src={logo} 
              alt="Company Logo" 
              draggable="false"
            />
          </motion.div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-400">Sign in to access the dashboard</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email ? 'focus:ring-red-500 border-red-500' : 'focus:ring-indigo-500 border-gray-600'
                } border transition duration-200`}
              />
            </div>
            {errors.email && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center text-red-400 text-sm mt-1"
              >
                <FiAlertCircle className="mr-1" /> {errors.email}
              </motion.p>
            )}
          </div>

          <div>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password ? 'focus:ring-red-500 border-red-500' : 'focus:ring-indigo-500 border-gray-600'
                } border transition duration-200`}
              />
            </div>
            {errors.password && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center text-red-400 text-sm mt-1"
              >
                <FiAlertCircle className="mr-1" /> {errors.password}
              </motion.p>
            )}
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className={`w-full p-3 text-white rounded-lg transition duration-300 shadow-lg flex items-center justify-center ${
              isLoading ? 'bg-indigo-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Authenticating...
              </>
            ) : (
              "Login"
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Tailwind Clip-Path Customization */}
      <style>
        {`
          .clip-path-custom {
            clip-path: polygon(0 0, 100% 0, 100% 85%, 60% 100%, 0 85%);
          }
        `}
      </style>
    </div>
  );
}