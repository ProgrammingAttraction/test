import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaCalendarAlt, FaPercentage, FaMoneyBill, FaDice, 
  FaGift, FaSpinner, FaSave, FaTimes, FaInfoCircle, 
  FaSearch, FaUser, FaUsers, FaGlobe, FaLock, FaUserPlus,
  FaGamepad, FaChevronDown, FaChevronUp, FaCoins, FaWallet,
  FaHourglass, FaInfinity, FaClock
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';

const Createbonus = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [bonusTypes, setBonusTypes] = useState([
    'welcome', 'deposit', 'reload', 'cashback', 'free_spin', 'special', 'manual'
  ]);
  
  // NEW: Validity Types
  const validityTypes = [
    { 
      value: 'days', 
      label: 'Days', 
      icon: <FaCalendarAlt />, 
      description: 'Set validity in days',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      value: 'hours', 
      label: 'Hours', 
      icon: <FaClock />, 
      description: 'Set validity in hours',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      value: 'infinite', 
      label: 'Infinite', 
      icon: <FaInfinity />, 
      description: 'No expiration (never expires)',
      color: 'from-green-500 to-emerald-600'
    }
  ];
  
  // Balance Types
  const balanceTypes = [
    { 
      value: 'bonus_balance', 
      label: 'Bonus Balance', 
      icon: <FaCoins />, 
      description: 'Bonus goes to bonus balance (with wagering requirements)',
      color: 'from-amber-500 to-orange-500'
    },
    { 
      value: 'cash_balance', 
      label: 'Cash Balance', 
      icon: <FaWallet />, 
      description: 'Bonus goes directly to cash balance (withdrawable)',
      color: 'from-green-500 to-emerald-500'
    }
  ];
  
  const [distributionTypes, setDistributionTypes] = useState([
    { value: 'public', label: 'Public', icon: <FaGlobe />, description: 'Available to all users with bonus code' },
    { value: 'private', label: 'Private', icon: <FaLock />, description: 'Only assigned users can claim with code' },
    { value: 'single_user', label: 'Single User', icon: <FaUserPlus />, description: 'Automatically assigned to specific user' }
  ]);
  
  // Game categories in Bengali
  const gameCategories = [
    { id: 'all', name: 'সব গেম', icon: '🎮', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { id: 'গরম খেলা', name: 'গরম খেলা', icon: '🔥', color: 'bg-red-100 text-red-800 border-red-200' },
    { id: 'স্লট গেম', name: 'স্লট গেম', icon: '🎰', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { id: 'টেবিল', name: 'টেবিল', icon: '♠️', color: 'bg-green-100 text-green-800 border-green-200' },
    { id: 'ক্যাসিনো', name: 'ক্যাসিনো', icon: '🎲', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'রুলেট', name: 'রুলেট', icon: '🎡', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    { id: 'ইনস্ট্যান্ট', name: 'ইনস্ট্যান্ট', icon: '⚡', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { id: 'স্ক্র্যাচ কার্ড', name: 'স্ক্র্যাচ কার্ড', icon: '🎫', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { id: 'ফিশিং', name: 'ফিশিং', icon: '🎣', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    { id: 'পোকার', name: 'পোকার', icon: '🃏', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    { id: 'ভিডিও পোকার', name: 'ভিডিও পোকার', icon: '🎬', color: 'bg-lime-100 text-lime-800 border-lime-200' },
    { id: 'ক্রাশ', name: 'ক্রাশ', icon: '💥', color: 'bg-rose-100 text-rose-800 border-rose-200' },
    { id: 'লাইভ ডিলার', name: 'লাইভ ডিলার', icon: '👨‍💼', color: 'bg-violet-100 text-violet-800 border-violet-200' },
    { id: 'লটারি', name: 'লটারি', icon: '🎱', color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200' },
    { id: 'ভি-স্পোর্টস', name: 'ভি-স্পোর্টস', icon: '⚽', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { id: 'জনপ্রিয়', name: 'জনপ্রিয়', icon: '⭐', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { id: 'আমেরিকান রুলেট', name: 'আমেরিকান রুলেট', icon: '🎯', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    { id: 'কার্ড', name: 'কার্ড', icon: '🃏', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    { id: 'ব্ল্যাকজ্যাক', name: 'ব্ল্যাকজ্যাক', icon: '♣️', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  ];
  
  const [formData, setFormData] = useState({
    name: '',
    bonusCode: '',
    bonusType: 'deposit',
    balanceType: 'bonus_balance',
    amount: 0,
    percentage: 0,
    minDeposit: 0,
    maxBonus: null,
    wageringRequirement: 0,
    // UPDATED: New validity fields
    validityType: 'days',
    validityValue: 30,
    // Keep for backward compatibility
    validityDays: 30,
    gamesCategory: ['all'],
    status: 'active',
    distributionType: 'public',
    maxClaims: null,
    reusable: false,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    assignedUsers: []
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // User selection states
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSelectAll, setUserSelectAll] = useState(false);
  
  // Game category states
  const [selectedGameCategories, setSelectedGameCategories] = useState(['all']);
  const [showGameCategorySelector, setShowGameCategorySelector] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(gameCategories);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Filter categories based on search term
  useEffect(() => {
    if (categorySearchTerm.trim() === '') {
      setFilteredCategories(gameCategories);
    } else {
      const filtered = gameCategories.filter(category =>
        category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
        category.id.toLowerCase().includes(categorySearchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [categorySearchTerm]);

  // Update form data when selectedGameCategories changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      gamesCategory: selectedGameCategories
    }));
  }, [selectedGameCategories]);

  // Handle validity type change
  const handleValidityTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      validityType: type,
      // Reset validity value based on type
      validityValue: type === 'infinite' ? 0 : (type === 'hours' ? 24 : 30),
      // Keep backward compatibility
      validityDays: type === 'days' ? (type === 'hours' ? 1 : 30) : 30
    }));
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch(`${base_url}/admin/all-active-users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
        setFilteredUsers(data.data);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox differently
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    // Convert number inputs to appropriate types
    const processedValue = type === 'number' 
      ? (value === '' ? '' : parseFloat(value))
      : value;

    const updatedFormData = {
      ...formData,
      [name]: processedValue
    };

    // Keep validityDays in sync for backward compatibility
    if (name === 'validityValue' && formData.validityType === 'days') {
      updatedFormData.validityDays = processedValue;
    }

    setFormData(updatedFormData);

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle distribution type change
  const handleDistributionTypeChange = (type) => {
    setFormData(prev => ({ ...prev, distributionType: type }));
    
    // Clear assigned users when switching away from private/single_user
    if (type === 'public') {
      setSelectedUsers([]);
    }
  };

  // Handle balance type change
  const handleBalanceTypeChange = (type) => {
    setFormData(prev => ({ ...prev, balanceType: type }));
    
    // If changing to cash balance and wagering requirement is set, warn user
    if (type === 'cash_balance' && formData.wageringRequirement > 0) {
      toast.success('Bonus will go directly to cash balance. Wagering requirement may not apply.', {
        duration: 5000,
        icon: '💰'
      });
    }
  };

  // Generate random bonus code (only for public/private bonuses)
  const generateBonusCode = () => {
    if (formData.distributionType === 'single_user') {
      toast.error('Single user bonuses do not require bonus codes');
      return;
    }
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, bonusCode: code }));
  };

  // Toggle user selection
  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u._id === user._id);
      if (isSelected) {
        return prev.filter(u => u._id !== user._id);
      } else {
        // For single user distribution, only allow one selection
        if (formData.distributionType === 'single_user' && prev.length >= 1) {
          toast.error('Single user bonuses can only be assigned to one user');
          return prev;
        }
        return [...prev, user];
      }
    });
  };

  // Select all users
  const handleSelectAll = () => {
    if (userSelectAll) {
      setSelectedUsers([]);
    } else {
      // For single user distribution, only select first user
      if (formData.distributionType === 'single_user') {
        setSelectedUsers([filteredUsers[0]]);
        toast.info('Single user bonuses can only be assigned to one user');
      } else {
        setSelectedUsers([...filteredUsers]);
      }
    }
    setUserSelectAll(!userSelectAll);
  };

  // Remove selected user
  const removeSelectedUser = (userId) => {
    setSelectedUsers(prev => prev.filter(user => user._id !== userId));
  };

  // Clear all selected users
  const clearSelectedUsers = () => {
    setSelectedUsers([]);
    setUserSelectAll(false);
  };

  // Handle game category selection
  const toggleGameCategory = (categoryId) => {
    setSelectedGameCategories(prev => {
      // If clicking "all", clear all other selections
      if (categoryId === 'all') {
        return ['all'];
      }
      
      // If "all" is currently selected, remove it and add the new category
      if (prev.includes('all')) {
        return [categoryId];
      }
      
      // If category is already selected, remove it
      if (prev.includes(categoryId)) {
        const newSelection = prev.filter(id => id !== categoryId);
        // If no categories selected, default back to "all"
        return newSelection.length > 0 ? newSelection : ['all'];
      }
      
      // Add new category
      const newSelection = [...prev, categoryId];
      
      // If selecting more than 8 categories, show warning and don't add
      if (newSelection.length > 8) {
        toast.error('Maximum 8 game categories can be selected');
        return prev;
      }
      
      return newSelection;
    });
  };

  // Get category display name
  const getCategoryName = (categoryId) => {
    const category = gameCategories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  // Get category icon
  const getCategoryIcon = (categoryId) => {
    const category = gameCategories.find(cat => cat.id === categoryId);
    return category ? category.icon : '🎮';
  };

  // Get category color class
  const getCategoryColor = (categoryId) => {
    const category = gameCategories.find(cat => cat.id === categoryId);
    return category ? category.color : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Select all game categories
  const handleSelectAllCategories = () => {
    setSelectedGameCategories(['all']);
    setShowAllCategories(false);
  };

  // Clear all game categories (go back to "all")
  const clearGameCategories = () => {
    setSelectedGameCategories(['all']);
    setCategorySearchTerm('');
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Bonus name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Bonus name must be at least 3 characters';
    }

    // Amount or percentage validation
    if (formData.amount <= 0 && formData.percentage <= 0) {
      newErrors.amount = 'Either amount or percentage must be greater than 0';
      newErrors.percentage = 'Either amount or percentage must be greater than 0';
    }

    // Amount validation
    if (formData.amount < 0) {
      newErrors.amount = 'Amount cannot be negative';
    }

    // Percentage validation
    if (formData.percentage < 0) {
      newErrors.percentage = 'Percentage cannot be negative';
    } else if (formData.percentage > 500) {
      newErrors.percentage = 'Percentage cannot exceed 500%';
    }

    // Min deposit validation
    if (formData.minDeposit < 0) {
      newErrors.minDeposit = 'Minimum deposit cannot be negative';
    }

    // Max bonus validation
    if (formData.maxBonus !== null && formData.maxBonus < 0) {
      newErrors.maxBonus = 'Maximum bonus cannot be negative';
    }

    // Wagering requirement validation
    if (formData.wageringRequirement < 0) {
      newErrors.wageringRequirement = 'Wagering requirement cannot be negative';
    } else if (formData.wageringRequirement > 100) {
      newErrors.wageringRequirement = 'Wagering requirement cannot exceed 100x';
    }

    // UPDATED: Validity validation based on type
    if (formData.validityType !== 'infinite') {
      if (!formData.validityValue || formData.validityValue <= 0) {
        newErrors.validityValue = `Validity ${formData.validityType} must be greater than 0`;
      } else if (formData.validityType === 'days' && formData.validityValue > 365) {
        newErrors.validityValue = 'Validity days cannot exceed 365 days';
      } else if (formData.validityType === 'hours' && formData.validityValue > 720) {
        newErrors.validityValue = 'Validity hours cannot exceed 720 hours (30 days)';
      }
    }

    // Max claims validation
    if (formData.maxClaims !== null && formData.maxClaims <= 0) {
      newErrors.maxClaims = 'Max claims must be greater than 0';
    }

    // Date validation
    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    // User selection validation for private/single_user bonuses
    if (formData.distributionType === 'private' && selectedUsers.length === 0) {
      newErrors.assignedUsers = 'Please select at least one user for private bonus';
    }
    
    if (formData.distributionType === 'single_user' && selectedUsers.length !== 1) {
      newErrors.assignedUsers = 'Please select exactly one user for single user bonus';
    }

    // Bonus code validation for private bonuses
    if (formData.distributionType === 'private' && !formData.bonusCode.trim()) {
      newErrors.bonusCode = 'Bonus code is required for private bonuses';
    }

    // Game categories validation
    if (!formData.gamesCategory || formData.gamesCategory.length === 0) {
      newErrors.gamesCategory = 'Please select at least one game category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare request body
      const requestBody = {
        ...formData,
        amount: formData.amount || 0,
        percentage: formData.percentage || 0,
        maxBonus: formData.maxBonus === '' ? null : formData.maxBonus,
        maxClaims: formData.maxClaims === '' ? null : formData.maxClaims,
        endDate: formData.endDate === '' ? null : formData.endDate,
        gamesCategory: formData.gamesCategory,
        balanceType: formData.balanceType,
        // UPDATED: Include new validity fields
        validityType: formData.validityType,
        validityValue: formData.validityType === 'infinite' ? 0 : formData.validityValue,
        // Keep backward compatibility
        validityDays: formData.validityType === 'days' ? formData.validityValue : 30
      };

      // Add assigned user ID for single user bonus
      if (formData.distributionType === 'single_user' && selectedUsers.length === 1) {
        requestBody.assignedUserId = selectedUsers[0]._id;
      }

      const response = await fetch(`${base_url}/admin/bonuses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create bonus');
      }

      // If private bonus and we have selected users, assign them
      if (formData.distributionType === 'private' && selectedUsers.length > 0) {
        await assignUsersToBonus(data.bonus._id, selectedUsers.map(u => u._id));
      }

      toast.success('Bonus created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        bonusCode: '',
        bonusType: 'deposit',
        balanceType: 'bonus_balance',
        amount: 0,
        percentage: 0,
        minDeposit: 0,
        maxBonus: null,
        wageringRequirement: 0,
        validityType: 'days',
        validityValue: 30,
        validityDays: 30,
        gamesCategory: ['all'],
        status: 'active',
        distributionType: 'public',
        maxClaims: null,
        reusable: false,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        assignedUsers: []
      });
      setSelectedUsers([]);
      setSelectedGameCategories(['all']);
      setUserSelectAll(false);

      // Navigate to bonuses list after 2 seconds
      setTimeout(() => {
        navigate('/deposit-bonus/bonus-list');
      }, 2000);

    } catch (error) {
      toast.error(error.message || 'Failed to create bonus');
      console.error('Error creating bonus:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Assign users to private bonus
  const assignUsersToBonus = async (bonusId, userIds) => {
    try {
      const response = await fetch(`${base_url}/admin/bonuses/${bonusId}/assign-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ userIds })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign users');
      }

      toast.success(`Bonus assigned to ${userIds.length} users`);
    } catch (error) {
      console.error('Error assigning users to bonus:', error);
      toast.error('Bonus created but failed to assign users');
    }
  };

  // Calculate bonus amount based on percentage
  const calculateBonusFromPercentage = () => {
    if (formData.percentage > 0 && formData.minDeposit > 0) {
      const calculated = (formData.minDeposit * formData.percentage) / 100;
      if (formData.maxBonus && calculated > formData.maxBonus) {
        return formData.maxBonus;
      }
      return calculated;
    }
    return formData.amount;
  };

  // Format bonus type for display
  const formatBonusType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get bonus type icon
  const getBonusTypeIcon = (type) => {
    switch(type) {
      case 'welcome': return '🎉';
      case 'deposit': return '💰';
      case 'reload': return '🔄';
      case 'cashback': return '💸';
      case 'free_spin': return '🎰';
      case 'special': return '⭐';
      case 'manual': return '✏️';
      default: return '🎁';
    }
  };

  // Get distribution type info
  const getDistributionTypeInfo = (type) => {
    return distributionTypes.find(dt => dt.value === type);
  };

  // Get balance type info
  const getBalanceTypeInfo = (type) => {
    return balanceTypes.find(bt => bt.value === type);
  };

  // NEW: Get validity type info
  const getValidityTypeInfo = (type) => {
    return validityTypes.find(vt => vt.value === type);
  };

  // NEW: Get validity description
  const getValidityDescription = () => {
    if (formData.validityType === 'infinite') {
      return 'Never expires';
    }
    return `Valid for ${formData.validityValue} ${formData.validityType}`;
  };

  // Get selected categories display text
  const getSelectedCategoriesText = () => {
    if (selectedGameCategories.includes('all')) {
      return 'সব গেম';
    }
    
    if (selectedGameCategories.length > 2) {
      return `${selectedGameCategories.length} টি ক্যাটাগরি সিলেক্ট করা হয়েছে`;
    }
    
    return selectedGameCategories.map(cat => getCategoryName(cat)).join(', ');
  };

  if (loading) {
    return (
      <section className="font-nunito h-screen">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'ml-[17%]' : 'ml-0'}`}>
            <div className="flex items-center justify-center h-full">
              <div className="flex justify-center items-center py-8">
                <FaSpinner className="animate-spin text-blue-500 text-2xl" />
              </div>
            </div>
          </main>
        </div>
      </section>
    );
  }

  return (
    <section className="font-bai h-screen bg-blue-50">
      <Toaster position="top-right" autoClose={5000} />
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex">
        <main className="w-full mx-auto px-4 py-8">
          <div className="w-full mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Bonus</h1>
                  <p className="text-sm md:text-base text-gray-500 mt-1">
                    Create attractive bonuses to engage and reward your players
                  </p>
                </div>
              </div>
            </div>

            {/* Main Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Bonus Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bonus Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Welcome Bonus"
                        className={`w-full px-4 py-3 text-gray-700 border rounded-lg outline-blue-500 focus:border-blue-500 ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <FaInfoCircle /> {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Balance Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Balance Type <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {balanceTypes.map(type => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleBalanceTypeChange(type.value)}
                            className={`p-4 rounded-lg text-white border transition-all duration-200 flex flex-col items-center justify-center gap-3 relative ${
                              formData.balanceType === type.value
                                ? 'border-blue-500 shadow-lg scale-[1.02]'
                                : 'border-gray-200 hover:border-blue-300 hover:scale-[1.01]'
                            } bg-gradient-to-r ${type.color}`}
                          >
                            <span className="text-2xl">{type.icon}</span>
                            <div className="text-center">
                              <span className="text-lg font-bold block">{type.label}</span>
                              <span className="text-xs opacity-90 mt-1 block">{type.description}</span>
                            </div>
                            {formData.balanceType === type.value && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {formData.balanceType === 'bonus_balance' 
                          ? 'Bonus balance has wagering requirements and separate playthrough rules.'
                          : 'Cash balance can be withdrawn directly (subject to platform rules).'
                        }
                      </p>
                    </div>

                    {/* NEW: Validity Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Validity Type <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {validityTypes.map(type => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleValidityTypeChange(type.value)}
                            className={`p-4 rounded-lg text-white border transition-all duration-200 flex flex-col items-center justify-center gap-3 relative ${
                              formData.validityType === type.value
                                ? 'border-blue-500 shadow-lg scale-[1.02]'
                                : 'border-gray-200 hover:border-blue-300 hover:scale-[1.01]'
                            } bg-gradient-to-r ${type.color}`}
                          >
                            <span className="text-2xl">{type.icon}</span>
                            <div className="text-center">
                              <span className="text-lg font-bold block">{type.label}</span>
                              <span className="text-xs opacity-90 mt-1 block">{type.description}</span>
                            </div>
                            {formData.validityType === type.value && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {formData.validityType === 'infinite' 
                          ? 'Bonus will never expire. Useful for loyalty bonuses.'
                          : `Bonus will expire after ${formData.validityValue} ${formData.validityType}.`
                        }
                      </p>
                    </div>

                    {/* NEW: Validity Value (Conditional) */}
                    {formData.validityType !== 'infinite' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Validity {formData.validityType === 'days' ? 'Days' : 'Hours'} <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="number"
                            name="validityValue"
                            value={formData.validityValue}
                            onChange={handleInputChange}
                            min="1"
                            max={formData.validityType === 'days' ? "365" : "720"}
                            className={`w-full px-4 py-3 text-gray-700 border rounded-lg outline-blue-500 focus:border-blue-500 ${
                              errors.validityValue ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          <span className="text-lg font-bold text-blue-600 whitespace-nowrap">
                            {formData.validityType === 'days' ? 'Days' : 'Hours'}
                          </span>
                        </div>
                        {errors.validityValue && (
                          <p className="mt-1 text-sm text-red-500">{errors.validityValue}</p>
                        )}
                        <p className="mt-2 text-sm text-gray-600">
                          {formData.validityType === 'days' 
                            ? `Bonus will expire after ${formData.validityValue} day${formData.validityValue !== 1 ? 's' : ''} from activation`
                            : `Bonus will expire after ${formData.validityValue} hour${formData.validityValue !== 1 ? 's' : ''} from activation`
                          }
                        </p>
                      </div>
                    )}

                    {/* Distribution Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Distribution Type <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {distributionTypes.map(type => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleDistributionTypeChange(type.value)}
                            className={`p-4 rounded-lg text-gray-700 border transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                              formData.distributionType === type.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            <span className="text-xl">{type.icon}</span>
                            <span className="text-sm font-medium">{type.label}</span>
                            <span className="text-xs text-gray-500 text-center">{type.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bonus Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bonus Type <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {bonusTypes.map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, bonusType: type }))}
                            className={`p-3 rounded-lg text-gray-700 border transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                              formData.bonusType === type
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            <span className="text-xl">{getBonusTypeIcon(type)}</span>
                            <span className="text-xs font-medium">{formatBonusType(type)}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Game Categories */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Applicable Game Categories <span className="text-red-500">*</span>
                      </label>
                      
                      {/* Selected Categories Display */}
                      <div className="mb-2">
                        <div className="flex flex-wrap gap-2">
                          {selectedGameCategories.map(categoryId => (
                            <div
                              key={categoryId}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2 ${getCategoryColor(categoryId)}`}
                            >
                              <span>{getCategoryIcon(categoryId)}</span>
                              <span>{getCategoryName(categoryId)}</span>
                              <button
                                type="button"
                                onClick={() => toggleGameCategory(categoryId)}
                                className="ml-1 hover:text-red-600"
                              >
                                <FaTimes className="text-xs" />
                              </button>
                            </div>
                          ))}
                        </div>
                        {selectedGameCategories.length > 0 && !selectedGameCategories.includes('all') && (
                          <p className="text-xs text-gray-500 mt-2">
                            {selectedGameCategories.length} category selected
                          </p>
                        )}
                      </div>

                      {/* Category Selector */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowGameCategorySelector(!showGameCategorySelector)}
                          className={`w-full px-4 py-3 text-left border rounded-lg flex items-center justify-between ${
                            errors.gamesCategory ? 'border-red-500' : 'border-gray-300'
                          } ${showGameCategorySelector ? 'border-blue-500' : ''}`}
                        >
                          <div className="flex items-center gap-2">
                            <FaGamepad className="text-gray-400" />
                            <span className="text-gray-700">
                              {getSelectedCategoriesText()}
                            </span>
                          </div>
                          {showGameCategorySelector ? (
                            <FaChevronUp className="text-gray-400" />
                          ) : (
                            <FaChevronDown className="text-gray-400" />
                          )}
                        </button>
                        
                        {showGameCategorySelector && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <div className="p-3 border-b border-gray-200">
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <FaSearch className="text-gray-400 text-sm" />
                                </div>
                                <input
                                  type="text"
                                  placeholder="Search game categories..."
                                  value={categorySearchTerm}
                                  onChange={(e) => setCategorySearchTerm(e.target.value)}
                                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg placeholder:text-gray-500 text-gray-500 outline-blue-500"
                                />
                              </div>
                              
                              <div className="flex items-center justify-between mt-3">
                                <button
                                  type="button"
                                  onClick={handleSelectAllCategories}
                                  className="text-xs text-blue-600 hover:text-blue-700"
                                >
                                  Select All Games
                                </button>
                                <button
                                  type="button"
                                  onClick={clearGameCategories}
                                  className="text-xs text-red-600 hover:text-red-700"
                                >
                                  Clear Selection
                                </button>
                              </div>
                            </div>
                            
                            <div className="max-h-60 overflow-y-auto p-2">
                              {filteredCategories.map(category => {
                                const isSelected = selectedGameCategories.includes(category.id);
                                return (
                                  <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => toggleGameCategory(category.id)}
                                    className={`w-full p-3 text-left rounded-lg mb-1 flex items-center gap-3 transition-all duration-200 ${
                                      isSelected
                                        ? 'bg-blue-50 border border-blue-200 text-blue-700'
                                        : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    <span className="text-xl">{category.icon}</span>
                                    <div className="flex-1">
                                      <div className="font-medium">{category.name}</div>
                                      <div className="text-xs text-gray-500">{category.id}</div>
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {}}
                                      className="h-4 w-4 text-blue-600 rounded"
                                    />
                                  </button>
                                );
                              })}
                              
                              {filteredCategories.length === 0 && (
                                <div className="text-center py-4 text-gray-500">
                                  No categories found
                                </div>
                              )}
                            </div>
                            
                            <div className="p-3 border-t border-gray-200 bg-gray-50">
                              <div className="text-xs text-gray-500">
                                {selectedGameCategories.includes('all') ? (
                                  'Bonus applicable to all games'
                                ) : (
                                  `Bonus applicable to ${selectedGameCategories.length} game categories`
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {errors.gamesCategory && (
                        <p className="mt-1 text-sm text-red-500">{errors.gamesCategory}</p>
                      )}
                      
                      <p className="mt-2 text-sm text-gray-600">
                        Select which games this bonus can be used for. Select "সব গেম" for all games.
                      </p>
                    </div>

                    {/* Bonus Code (conditional based on distribution type) */}
                    {formData.distributionType !== 'single_user' && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Bonus Code {formData.distributionType === 'private' && <span className="text-red-500">*</span>}
                          </label>
                          <button
                            type="button"
                            onClick={generateBonusCode}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <FaPlus className="text-xs" /> Generate Code
                          </button>
                        </div>
                        <input
                          type="text"
                          name="bonusCode"
                          value={formData.bonusCode}
                          onChange={handleInputChange}
                          placeholder={formData.distributionType === 'private' 
                            ? "Enter unique bonus code (required)" 
                            : "WELCOME2024 (leave blank to auto-generate)"
                          }
                          className={`w-full px-4 py-3 border text-gray-700 rounded-lg outline-blue-500 focus:border-blue-500 uppercase ${
                            errors.bonusCode ? 'border-red-500' : 'border-gray-300'
                          }`}
                          maxLength={20}
                          required={formData.distributionType === 'private'}
                        />
                        {errors.bonusCode && (
                          <p className="mt-1 text-sm text-red-500">{errors.bonusCode}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          {formData.distributionType === 'public' 
                            ? 'Use uppercase letters and numbers. Auto-generated code will be 8 characters.'
                            : 'Private bonuses require a unique code that only assigned users can use.'
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Amount & Percentage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fixed Amount (BDT)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaBangladeshiTakaSign className="text-gray-400" />
                          </div>
                          <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className={`w-full pl-10 pr-4 py-3 text-gray-700 border rounded-lg outline-blue-500 focus:border-blue-500 ${
                              errors.amount ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {errors.amount && (
                          <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Percentage (%)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaPercentage className="text-gray-400" />
                          </div>
                          <input
                            type="number"
                            name="percentage"
                            value={formData.percentage}
                            onChange={handleInputChange}
                            min="0"
                            max="500"
                            step="0.1"
                            className={`w-full pl-10 pr-4 py-3 text-gray-700 border rounded-lg outline-blue-500 focus:border-blue-500 ${
                              errors.percentage ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {errors.percentage && (
                          <p className="mt-1 text-sm text-red-500">{errors.percentage}</p>
                        )}
                      </div>
                    </div>

                    {/* Minimum Deposit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Deposit (BDT)
                      </label>
                      <input
                        type="number"
                        name="minDeposit"
                        value={formData.minDeposit}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className={`w-full px-4 py-3 border text-gray-700 rounded-lg outline-blue-500 focus:border-blue-500 ${
                          errors.minDeposit ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.minDeposit && (
                        <p className="mt-1 text-sm text-red-500">{errors.minDeposit}</p>
                      )}
                    </div>

                    {/* Maximum Bonus */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Bonus (BDT)
                      </label>
                      <input
                        type="number"
                        name="maxBonus"
                        value={formData.maxBonus === null ? '' : formData.maxBonus}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        placeholder="Leave blank for no limit"
                        className={`w-full px-4 py-3 border rounded-lg text-gray-700 outline-blue-500 focus:border-blue-500 ${
                          errors.maxBonus ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.maxBonus && (
                        <p className="mt-1 text-sm text-red-500">{errors.maxBonus}</p>
                      )}
                    </div>

                    {/* Maximum Claims (for public bonuses) */}
                    {formData.distributionType === 'public' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Claims
                        </label>
                        <input
                          type="number"
                          name="maxClaims"
                          value={formData.maxClaims === null ? '' : formData.maxClaims}
                          onChange={handleInputChange}
                          min="1"
                          placeholder="Leave blank for unlimited claims"
                          className={`w-full px-4 py-3 text-gray-700 border rounded-lg outline-blue-500 focus:border-blue-500 ${
                            errors.maxClaims ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.maxClaims && (
                          <p className="mt-1 text-sm text-red-500">{errors.maxClaims}</p>
                        )}
                      </div>
                    )}

                    {/* Reusable (for public bonuses) */}
                    {formData.distributionType === 'public' && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="reusable"
                          checked={formData.reusable}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Allow users to claim this bonus multiple times
                        </label>
                      </div>
                    )}

                    {/* User Selection (for private and single_user bonuses) */}
                    {(formData.distributionType === 'private' || formData.distributionType === 'single_user') && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {formData.distributionType === 'single_user' ? 'Select User' : 'Select Users'} 
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2">
                            {selectedUsers.length > 0 && (
                              <button
                                type="button"
                                onClick={clearSelectedUsers}
                                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                              >
                                <FaTimes /> Clear All
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setShowUserSelector(!showUserSelector)}
                              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <FaSearch /> {showUserSelector ? 'Hide' : 'Browse Users'}
                            </button>
                          </div>
                        </div>

                        {/* Selected Users Display */}
                        {selectedUsers.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {selectedUsers.map(user => (
                                <div
                                  key={user._id}
                                  className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200"
                                >
                                  <FaUser className="text-sm" />
                                  <span className="text-sm font-medium">
                                    {user.username || user.email}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeSelectedUser(user._id)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <FaTimes className="text-xs" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                              {selectedUsers.length} {formData.distributionType === 'single_user' ? 'user' : 'users'} selected
                            </p>
                          </div>
                        )}

                        {errors.assignedUsers && (
                          <p className="mt-1 text-sm text-red-500 mb-2">{errors.assignedUsers}</p>
                        )}

                        {/* User Selector Modal */}
                        {showUserSelector && (
                          <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-medium text-gray-700">Select Users</h4>
                              <div className="flex items-center gap-2">
                                <label className="flex items-center text-sm">
                                  <input
                                    type="checkbox"
                                    checked={userSelectAll}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 text-blue-600 rounded"
                                  />
                                  <span className="ml-2 text-gray-500">Select All</span>
                                </label>
                              </div>
                            </div>

                            {/* Search Bar */}
                            <div className="relative mb-4">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                              </div>
                              <input
                                type="text"
                                placeholder="Search users by username, email, or name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 text-gray-500 outline-blue-500"
                              />
                            </div>

                            {/* Users List */}
                            <div className="max-h-60 overflow-y-auto">
                              {loadingUsers ? (
                                <div className="flex justify-center py-4">
                                  <FaSpinner className="animate-spin text-blue-500" />
                                </div>
                              ) : filteredUsers.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No users found</p>
                              ) : (
                                <div className="grid gap-2">
                                  {filteredUsers.map(user => {
                                    const isSelected = selectedUsers.some(u => u._id === user._id);
                                    const isSingleUserSelected = formData.distributionType === 'single_user' && selectedUsers.length >= 1;
                                    
                                    return (
                                      <div
                                        key={user._id}
                                        onClick={() => {
                                          if (!isSingleUserSelected || isSelected) {
                                            toggleUserSelection(user);
                                          }
                                        }}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                                          isSelected
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : isSingleUserSelected
                                            ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                        }`}
                                      >
                                        <div className="flex items-center gap-3 text-gray-700">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            isSelected ? 'bg-blue-100' : 'bg-gray-100'
                                          }`}>
                                            <FaUser className={isSelected ? 'text-blue-600' : 'text-gray-400'} />
                                          </div>
                                          <div>
                                            <div className="font-medium">{user.username || user.email}</div>
                                            <div className="text-xs text-gray-500">
                                              {user.firstName && user.lastName 
                                                ? `${user.firstName} ${user.lastName}` 
                                                : user.email
                                              }
                                            </div>
                                          </div>
                                        </div>
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => {}}
                                          className="h-4 w-4 text-blue-600 rounded"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Instructions */}
                        <p className="text-xs text-gray-500">
                          {formData.distributionType === 'single_user' 
                            ? 'Select exactly one user who will receive this bonus automatically.'
                            : 'Select users who will be able to claim this bonus using the bonus code.'
                          }
                        </p>
                      </div>
                    )}

                    {/* Wagering Requirement */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wagering Requirement (x)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          name="wageringRequirement"
                          value={formData.wageringRequirement}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                          step="1"
                          className="flex-1 h-2 bg-gray-200 text-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                        />
                        <span className="text-lg font-bold text-blue-600 min-w-[60px]">
                          {formData.wageringRequirement}x
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>No Requirement</span>
                        <span>100x</span>
                      </div>
                      {errors.wageringRequirement && (
                        <p className="mt-1 text-sm text-red-500">{errors.wageringRequirement}</p>
                      )}
                      <p className="mt-2 text-sm text-gray-600">
                        {formData.balanceType === 'bonus_balance' ? (
                          `Players must wager bonus amount ${formData.wageringRequirement} times before withdrawal`
                        ) : (
                          <span className="text-amber-600">
                            Note: Wagering may not apply to cash balance bonuses. Check your platform rules.
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaCalendarAlt className="text-gray-400" />
                          </div>
                          <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full pl-10 pr-4 text-gray-700 py-3 border border-gray-300 rounded-lg outline-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaCalendarAlt className="text-gray-400" />
                          </div>
                          <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            min={formData.startDate}
                            className={`w-full pl-10 text-gray-700 pr-4 py-3 border rounded-lg outline-blue-500 focus:border-blue-500 ${
                              errors.endDate ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {errors.endDate && (
                          <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value="active"
                            checked={formData.status === 'active'}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-gray-700 text-blue-600 outline-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Active</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value="inactive"
                            checked={formData.status === 'inactive'}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 outline-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Inactive</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bonus Preview Card */}
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaGift className="text-blue-600" /> Bonus Preview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Distribution Type</h4>
                      <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {getDistributionTypeInfo(formData.distributionType)?.icon}
                        {getDistributionTypeInfo(formData.distributionType)?.label}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Bonus Type</h4>
                      <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {getBonusTypeIcon(formData.bonusType)} {formatBonusType(formData.bonusType)}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Balance Type</h4>
                      <p className={`text-lg font-bold flex items-center gap-2 ${
                        formData.balanceType === 'cash_balance' ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {getBalanceTypeInfo(formData.balanceType)?.icon}
                        {getBalanceTypeInfo(formData.balanceType)?.label}
                      </p>
                    </div>
                    {/* NEW: Validity Preview */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Validity</h4>
                      <p className={`text-lg font-bold flex items-center gap-2 ${
                        formData.validityType === 'infinite' ? 'text-green-600' : 
                        formData.validityType === 'hours' ? 'text-purple-600' : 'text-blue-600'
                      }`}>
                        {getValidityTypeInfo(formData.validityType)?.icon}
                        {getValidityDescription()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Assigned Users</h4>
                      <p className="text-sm text-gray-700">
                        {formData.distributionType === 'public' ? (
                          'Available to all users'
                        ) : formData.distributionType === 'private' && selectedUsers.length > 0 ? (
                          <span>
                            {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} can claim
                          </span>
                        ) : formData.distributionType === 'single_user' && selectedUsers.length === 1 ? (
                          <span className="font-medium">
                            {selectedUsers[0].username || selectedUsers[0].email}
                          </span>
                        ) : (
                          'No users selected'
                        )}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Game Categories</h4>
                      <p className="text-sm text-gray-700 flex flex-wrap gap-1">
                        {selectedGameCategories.includes('all') ? (
                          <span className="font-medium text-green-600">All Games</span>
                        ) : (
                          selectedGameCategories.map(categoryId => (
                            <span 
                              key={categoryId}
                              className={`px-2 py-1 rounded text-xs ${getCategoryColor(categoryId)}`}
                            >
                              {getCategoryName(categoryId)}
                            </span>
                          ))
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Example Calculation</h4>
                      <p className="text-sm text-gray-700">
                        {formData.minDeposit > 0 && formData.percentage > 0 ? (
                          <>
                            Deposit <span className="font-bold">{formData.minDeposit.toFixed(2)} BDT</span> 
                            → Get <span className="font-bold text-green-600">
                              {calculateBonusFromPercentage().toFixed(2)} BDT
                            </span> bonus to{' '}
                            <span className={`font-bold ${
                              formData.balanceType === 'cash_balance' ? 'text-green-600' : 'text-amber-600'
                            }`}>
                              {formData.balanceType === 'cash_balance' ? 'Cash' : 'Bonus'} Balance
                            </span>
                            {' '}({getValidityDescription()})
                          </>
                        ) : formData.amount > 0 ? (
                          <>
                            Get <span className="font-bold text-green-600">
                              {formData.amount.toFixed(2)} BDT
                            </span> bonus to{' '}
                            <span className={`font-bold ${
                              formData.balanceType === 'cash_balance' ? 'text-green-600' : 'text-amber-600'
                            }`}>
                              {formData.balanceType === 'cash_balance' ? 'Cash' : 'Bonus'} Balance
                            </span>
                            {' '}({getValidityDescription()})
                          </>
                        ) : (
                          'Set bonus amount or percentage to see example'
                        )}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Wagering</h4>
                      <p className="text-lg font-bold text-blue-600">{formData.wageringRequirement}x</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.balanceType === 'cash_balance' 
                          ? 'May not apply to cash balance'
                          : 'Applies to bonus balance'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex flex-col-reverse md:flex-row justify-end gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" /> Creating...
                      </>
                    ) : (
                      <>
                        Create Bonus
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default Createbonus;