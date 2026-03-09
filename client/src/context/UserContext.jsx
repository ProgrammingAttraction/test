import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const storedUser = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const fetchUserData = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/user/user-information/${storedUser?._id}`,{
        headers: {
             "Content-Type": "multipart/form-data",
             'Authorization': localStorage.getItem('token')
            },
      });
      if (response.data.success) {
        setUserData(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };
    useEffect(() => {
    // Only fetch user data if there is a logged-in user (storedUser and token exist)
    if (storedUser && token) {
      fetchUserData();
    } else {
      // Optionally reset state if no user is logged in
      setUserData(null);
      setLoading(false);
      setError(null);
    }
  }, []); // Empty dependency array ensures this runs only on mount
  const updateUserData = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  return (
    <UserContext.Provider value={{ userData, loading, error, fetchUserData, updateUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};