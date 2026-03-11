import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Header from '../common/Header';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast'; // Import react-hot-toast

const Createuser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    currency: 'BDT',
  });
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // State to track loading

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill out all fields!');
      return false;
    }
    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(formData.email)) {
      toast.error('Please enter a valid email address!');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true); // Set loading to true before submitting

    try {
      const response = await axios.post(`${base_url}/auth/signup`, formData);
      setMessage(response.data.message);
      toast(response.data.message);
    } catch (error) {
      setMessage('An error occurred while signing up.');
      toast.error('An error occurred while signing up.');
      console.error(error);
    } finally {
      setIsLoading(false); // Reset loading to false after response
    }
  };

  return (
    <div className="w-full font-bai">
      <Header />
      <Toaster />
      <section className="p-8 bg-white space-y-6">
        <h2 className="text-2xl font-semibold text-left text-indigo-600">Create User</h2>
        {message && (
          <p className="mb-4 text-center bg-red-100 border-red-200 border-[2px] rounded-[5px] px-[10px] py-[10px] text-red-500">
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-[5px] focus:outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-[5px] focus:outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-[5px] focus:outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full p-4 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="USD">BDT</option>
              <option value="EUR">USD</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white p-4 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading} // Disable the button when loading
          >
            {isLoading ? (
              <div className="flex justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 0116 0M4 12a8 8 0 0116 0"
                  ></path>
                </svg>
               <p className='ml-[10px]'> Loading...</p>
              </div>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Createuser;
