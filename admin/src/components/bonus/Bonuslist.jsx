import React, { useState, useEffect } from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaPlus, 
  FaSort, 
  FaSortUp, 
  FaSortDown, 
  FaGift, 
  FaCalendarAlt, 
  FaPercentage, 
  FaMoneyBill,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaExternalLinkAlt,
  FaCopy,
  FaCalendar,
  FaTimes,
  FaUserCheck,
  FaChartLine,
  FaShieldAlt,
  FaSave,
  FaGlobe,
  FaLock,
  FaUserPlus,
  FaCoins,
  FaWallet,
  FaGamepad,
  FaChevronDown,
  FaChevronUp,
  FaList,
  FaHourglass,
  FaInfinity,
  FaClock
} from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';

const Bonuslist = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [distributionFilter, setDistributionFilter] = useState('all');
  const [balanceFilter, setBalanceFilter] = useState('all');
  const [validityFilter, setValidityFilter] = useState('all'); // NEW: Validity type filter
  const [gamesCategoryFilter, setGamesCategoryFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBonuses, setTotalBonuses] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bonusToDelete, setBonusToDelete] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignAmount, setAssignAmount] = useState('');
  const [assignReason, setAssignReason] = useState('');
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [validateCode, setValidateCode] = useState('');
  const [validateUserId, setValidateUserId] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBonus, setEditingBonus] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    bonusCode: '',
    bonusType: 'deposit',
    balanceType: 'bonus_balance',
    amount: 0,
    percentage: 0,
    minDeposit: 0,
    maxBonus: 0,
    wageringRequirement: 0,
    // UPDATED: New validity fields
    validityType: 'days',
    validityValue: 30,
    validityDays: 30, // Keep for backward compatibility
    gamesCategory: ['all'],
    status: 'active',
    distributionType: 'public',
    maxClaims: null,
    reusable: false,
    startDate: '',
    endDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGameCategorySelector, setShowGameCategorySelector] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);

  // NEW: Validity types
  const validityTypes = [
    { value: 'days', label: 'Days', icon: <FaCalendarAlt />, color: 'text-blue-600' },
    { value: 'hours', label: 'Hours', icon: <FaClock />, color: 'text-purple-600' },
    { value: 'infinite', label: 'Infinite', icon: <FaInfinity />, color: 'text-green-600' }
  ];

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

  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const itemsPerPage = 10;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch bonuses from API
  useEffect(() => {
    fetchBonuses();
  }, [currentPage, statusFilter, typeFilter, distributionFilter, balanceFilter, validityFilter, gamesCategoryFilter, searchTerm, sortConfig]);

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

  const fetchBonuses = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction === 'descending' ? 'desc' : 'asc'
      });

      // Add filters if not 'all'
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (typeFilter !== 'all') queryParams.append('bonusType', typeFilter);
      if (distributionFilter !== 'all') queryParams.append('distributionType', distributionFilter);
      if (balanceFilter !== 'all') queryParams.append('balanceType', balanceFilter);
      if (validityFilter !== 'all') queryParams.append('validityType', validityFilter); // NEW
      if (gamesCategoryFilter !== 'all') queryParams.append('gamesCategory', gamesCategoryFilter);

      const response = await fetch(`${base_url}/admin/bonuses?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
        
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setBonuses(data.bonuses || []);
        setTotalPages(data.totalPages || 1);
        setTotalBonuses(data.total || 0);
      } else {
        throw new Error(data.error || 'Failed to fetch bonuses');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching bonuses:', err);
      toast.error(err.message || 'Failed to fetch bonuses');
    } finally {
      setLoading(false);
    }
  };

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active', color: 'emerald' },
    { value: 'inactive', label: 'Inactive', color: 'gray' },
    { value: 'expired', label: 'Expired', color: 'red' }
  ];

  // Bonus type options
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'welcome', label: 'Welcome Bonus', icon: '👋' },
    { value: 'deposit', label: 'Deposit Bonus', icon: '💰' },
    { value: 'reload', label: 'Reload Bonus', icon: '🔄' },
    { value: 'cashback', label: 'Cashback', icon: '💸' },
    { value: 'free_spin', label: 'Free Spins', icon: '🎰' },
    { value: 'special', label: 'Special Bonus', icon: '⭐' },
    { value: 'manual', label: 'Manual Bonus', icon: '✏️' }
  ];

  // Distribution type options
  const distributionOptions = [
    { value: 'all', label: 'All Distribution' },
    { value: 'public', label: 'Public', icon: <FaGlobe className="text-blue-500" /> },
    { value: 'private', label: 'Private', icon: <FaLock className="text-purple-500" /> },
    { value: 'single_user', label: 'Single User', icon: <FaUserPlus className="text-emerald-500" /> }
  ];

  // Balance type options
  const balanceTypeOptions = [
    { value: 'all', label: 'All Balance Types' },
    { value: 'bonus_balance', label: 'Bonus Balance', icon: <FaCoins className="text-amber-500" /> },
    { value: 'cash_balance', label: 'Cash Balance', icon: <FaWallet className="text-emerald-500" /> }
  ];

  // NEW: Validity type options
  const validityTypeOptions = [
    { value: 'all', label: 'All Validity Types' },
    { value: 'days', label: 'Days', icon: <FaCalendarAlt className="text-blue-500" /> },
    { value: 'hours', label: 'Hours', icon: <FaClock className="text-purple-500" /> },
    { value: 'infinite', label: 'Infinite', icon: <FaInfinity className="text-green-500" /> }
  ];

  // Handle sort
  const requestSort = (key) => {
    let direction = 'descending';
    if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400" />;
    if (sortConfig.direction === 'ascending') return <FaSortUp className="text-indigo-600" />;
    return <FaSortDown className="text-indigo-600" />;
  };

  // Handle bonus deletion
  const handleDelete = (id) => {
    setBonusToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${base_url}/admin/bonuses/${bonusToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete bonus');
      }

      setBonuses(bonuses.filter(bonus => bonus._id !== bonusToDelete));
      toast.success('Bonus deleted successfully');
      fetchBonuses(); // Refresh the list
    } catch (err) {
      toast.error(err.message || 'Failed to delete bonus');
    } finally {
      setShowDeleteConfirm(false);
      setBonusToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setBonusToDelete(null);
  };

  // Toggle bonus status
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await fetch(`${base_url}/admin/bonuses/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update bonus status');
      }

      setBonuses(bonuses.map(bonus => {
        if (bonus._id === id) {
          return { ...bonus, status: newStatus };
        }
        return bonus;
      }));

      toast.success(`Bonus status changed to ${newStatus}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update bonus status');
    }
  };

  // View bonus details
  const viewBonusDetails = (bonus) => {
    setSelectedBonus(bonus);
    setShowDetailsModal(true);
  };

  // Close details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBonus(null);
  };

  // Open assign modal
  const openAssignModal = (bonus) => {
    setSelectedBonus(bonus);
    setAssignAmount(bonus.amount || '');
    setAssignReason('');
    setAssignUserId('');
    setShowAssignModal(true);
  };

  // Handle assign bonus to user
  const handleAssignBonus = async (e) => {
    e.preventDefault();
    
    if (!assignUserId.trim()) {
      toast.error('Please enter user ID');
      return;
    }

    try {
      const response = await fetch(`${base_url}/admin/bonuses/${selectedBonus._id}/assign-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          userIds: [assignUserId],
          notes: assignReason || `Assigned by admin`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign bonus');
      }

      toast.success('Bonus assigned successfully');
      setShowAssignModal(false);
      setAssignUserId('');
      setAssignAmount('');
      setAssignReason('');
      fetchBonuses(); // Refresh to update claim count
    } catch (err) {
      toast.error(err.message || 'Failed to assign bonus');
    }
  };

  // Open validate modal
  const openValidateModal = () => {
    setValidateCode('');
    setValidateUserId('');
    setValidationResult(null);
    setShowValidateModal(true);
  };

  // Handle code validation
  const handleValidateCode = async (e) => {
    e.preventDefault();
    
    if (!validateCode.trim() || !validateUserId.trim()) {
      toast.error('Please enter both bonus code and user ID');
      return;
    }

    try {
      const response = await fetch(`${base_url}/admin/bonuses/validate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          bonusCode: validateCode.toUpperCase(),
          userId: validateUserId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Validation failed');
      }

      setValidationResult(data);
      if (data.isValid) {
        toast.success('Bonus code is valid!');
      }
    } catch (err) {
      toast.error(err.message || 'Validation failed');
      setValidationResult({ isValid: false, error: err.message });
    }
  };

  // Open edit modal
  const openEditModal = (bonus) => {
    setEditingBonus(bonus);
    setEditFormData({
      name: bonus.name || '',
      bonusCode: bonus.bonusCode || '',
      bonusType: bonus.bonusType || 'deposit',
      balanceType: bonus.balanceType || 'bonus_balance',
      amount: bonus.amount || 0,
      percentage: bonus.percentage || 0,
      minDeposit: bonus.minDeposit || 0,
      maxBonus: bonus.maxBonus || 0,
      wageringRequirement: bonus.wageringRequirement || 0,
      // UPDATED: New validity fields
      validityType: bonus.validityType || 'days',
      validityValue: bonus.validityValue || (bonus.validityType === 'infinite' ? 0 : bonus.validityDays || 30),
      validityDays: bonus.validityDays || (bonus.validityType === 'days' ? bonus.validityValue : 30),
      gamesCategory: bonus.gamesCategory || ['all'],
      status: bonus.status || 'active',
      distributionType: bonus.distributionType || 'public',
      maxClaims: bonus.maxClaims || null,
      reusable: bonus.reusable || false,
      startDate: bonus.startDate ? new Date(bonus.startDate).toISOString().split('T')[0] : '',
      endDate: bonus.endDate ? new Date(bonus.endDate).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingBonus(null);
    setEditFormData({
      name: '',
      bonusCode: '',
      bonusType: 'deposit',
      balanceType: 'bonus_balance',
      amount: 0,
      percentage: 0,
      minDeposit: 0,
      maxBonus: 0,
      wageringRequirement: 0,
      validityType: 'days',
      validityValue: 30,
      validityDays: 30,
      gamesCategory: ['all'],
      status: 'active',
      distributionType: 'public',
      maxClaims: null,
      reusable: false,
      startDate: '',
      endDate: ''
    });
    setIsSubmitting(false);
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setEditFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      const processedValue = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
      const updatedData = {
        ...editFormData,
        [name]: processedValue
      };

      // Keep validityDays in sync for backward compatibility
      if (name === 'validityValue' && updatedData.validityType === 'days') {
        updatedData.validityDays = processedValue;
      }

      setEditFormData(updatedData);
    }
  };

  // Handle validity type change in edit
  const handleEditValidityTypeChange = (type) => {
    setEditFormData(prev => ({
      ...prev,
      validityType: type,
      validityValue: type === 'infinite' ? 0 : (type === 'hours' ? 24 : 30),
      validityDays: type === 'days' ? (type === 'infinite' ? 0 : 30) : 30
    }));
  };

  // Handle balance type change in edit
  const handleEditBalanceTypeChange = (type) => {
    setEditFormData(prev => ({ ...prev, balanceType: type }));
  };

  // Handle game category selection in edit
  const handleEditGameCategoryToggle = (categoryId) => {
    setEditFormData(prev => {
      let newCategories;
      
      // If clicking "all", clear all other selections
      if (categoryId === 'all') {
        newCategories = ['all'];
      } else if (prev.gamesCategory.includes('all')) {
        // If "all" is currently selected, remove it and add the new category
        newCategories = [categoryId];
      } else if (prev.gamesCategory.includes(categoryId)) {
        // If category is already selected, remove it
        newCategories = prev.gamesCategory.filter(id => id !== categoryId);
        // If no categories selected, default back to "all"
        if (newCategories.length === 0) newCategories = ['all'];
      } else {
        // Add new category
        newCategories = [...prev.gamesCategory, categoryId];
        // Limit to 8 categories
        if (newCategories.length > 8) {
          toast.error('Maximum 8 game categories can be selected');
          return prev;
        }
      }
      
      return { ...prev, gamesCategory: newCategories };
    });
  };

  // Handle edit form submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare request body
      const requestBody = {
        ...editFormData,
        amount: editFormData.amount || 0,
        percentage: editFormData.percentage || 0,
        maxBonus: editFormData.maxBonus === '' ? null : editFormData.maxBonus,
        maxClaims: editFormData.maxClaims === '' ? null : editFormData.maxClaims,
        endDate: editFormData.endDate === '' ? null : editFormData.endDate,
        gamesCategory: editFormData.gamesCategory,
        balanceType: editFormData.balanceType,
        // UPDATED: Include new validity fields
        validityType: editFormData.validityType,
        validityValue: editFormData.validityType === 'infinite' ? 0 : editFormData.validityValue,
        validityDays: editFormData.validityType === 'days' ? editFormData.validityValue : 30
      };

      const response = await fetch(`${base_url}/admin/bonuses/${editingBonus._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update bonus');
      }

      // Update local state
      setBonuses(bonuses.map(bonus => 
        bonus._id === editingBonus._id ? { ...bonus, ...requestBody } : bonus
      ));

      toast.success('Bonus updated successfully');
      closeEditModal();
    } catch (err) {
      toast.error(err.message || 'Failed to update bonus');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy bonus code
  const copyBonusCode = (code) => {
    if (!code) {
      toast.error('No bonus code to copy');
      return;
    }
    navigator.clipboard.writeText(code);
    toast.success('Bonus code copied to clipboard!');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format bonus type
  const formatBonusType = (type) => {
    if (!type) return '';
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Format distribution type
  const formatDistributionType = (type) => {
    switch(type) {
      case 'public': return 'Public';
      case 'private': return 'Private';
      case 'single_user': return 'Single User';
      default: return type || 'Public';
    }
  };

  // Format balance type
  const formatBalanceType = (type) => {
    switch(type) {
      case 'bonus_balance': return 'Bonus Balance';
      case 'cash_balance': return 'Cash Balance';
      default: return type || 'Bonus Balance';
    }
  };

  // Format validity type
  const formatValidityType = (type) => {
    switch(type) {
      case 'days': return 'Days';
      case 'hours': return 'Hours';
      case 'infinite': return 'Infinite';
      default: return type || 'Days';
    }
  };

  // Get validity description
  const getValidityDescription = (bonus) => {
    if (bonus.validityType === 'infinite') {
      return 'Never expires';
    }
    
    if (bonus.validityType && bonus.validityValue) {
      return `${bonus.validityValue} ${bonus.validityType}`;
    }
    
    if (bonus.validityDays) {
      return `${bonus.validityDays} days`;
    }
    
    return '30 days';
  };

  // Get distribution type icon
  const getDistributionIcon = (type) => {
    switch(type) {
      case 'public': return <FaGlobe className="text-blue-500" />;
      case 'private': return <FaLock className="text-purple-500" />;
      case 'single_user': return <FaUserPlus className="text-emerald-500" />;
      default: return <FaGlobe className="text-gray-400" />;
    }
  };

  // Get balance type icon
  const getBalanceTypeIcon = (type) => {
    switch(type) {
      case 'bonus_balance': return <FaCoins className="text-amber-500" />;
      case 'cash_balance': return <FaWallet className="text-emerald-500" />;
      default: return <FaCoins className="text-gray-400" />;
    }
  };

  // NEW: Get validity type icon
  const getValidityTypeIcon = (type) => {
    switch(type) {
      case 'days': return <FaCalendarAlt className="text-blue-500" />;
      case 'hours': return <FaClock className="text-purple-500" />;
      case 'infinite': return <FaInfinity className="text-green-500" />;
      default: return <FaCalendarAlt className="text-gray-400" />;
    }
  };

  // Get bonus type icon
  const getBonusTypeIcon = (type) => {
    switch(type) {
      case 'welcome': return '👋';
      case 'deposit': return '💰';
      case 'reload': return '🔄';
      case 'cashback': return '💸';
      case 'free_spin': return '🎰';
      case 'special': return '⭐';
      case 'manual': return '✏️';
      default: return '🎁';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'expired': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get distribution color
  const getDistributionColor = (type) => {
    switch(type) {
      case 'public': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'private': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'single_user': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get balance type color
  const getBalanceTypeColor = (type) => {
    switch(type) {
      case 'bonus_balance': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cash_balance': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // NEW: Get validity type color
  const getValidityTypeColor = (type) => {
    switch(type) {
      case 'days': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'hours': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'infinite': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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

  // Calculate bonus display value
  const getBonusValue = (bonus) => {
    if (!bonus) return 'No Value';
    if (bonus.amount > 0) {
      return `${bonus.amount.toFixed(2)} BDT`;
    } else if (bonus.percentage > 0) {
      return `${bonus.percentage}% ${bonus.maxBonus ? `up to ${bonus.maxBonus?.toFixed(2)} BDT` : ''}`;
    }
    return 'No Value';
  };

  // Calculate claim info
  const getClaimInfo = (bonus) => {
    if (bonus.distributionType === 'public') {
      if (bonus.maxClaims) {
        return `${bonus.claimCount || 0}/${bonus.maxClaims} claims`;
      }
      return `${bonus.claimCount || 0} claims`;
    } else if (bonus.distributionType === 'private') {
      return `${bonus.assignedUsers?.length || 0} assigned`;
    }
    return 'Single user';
  };

  // Get games categories display
  const getGamesCategoriesDisplay = (categories) => {
    if (!categories || categories.length === 0) return 'All Games';
    if (categories.includes('all')) return 'All Games';
    
    if (categories.length > 2) {
      return `${categories.length} categories`;
    }
    
    return categories.map(cat => getCategoryName(cat)).join(', ');
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDistributionFilter('all');
    setBalanceFilter('all');
    setValidityFilter('all'); // NEW
    setGamesCategoryFilter('all');
    setCurrentPage(1);
  };

  // Handle page navigation
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading && bonuses.length === 0) {
    return (
      <section className="font-nunito h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'ml-[17%]' : 'ml-0'}`}>
            <div className="flex items-center justify-center h-full">
              <div className="flex justify-center items-center py-8">
                <FaSpinner className="animate-spin text-indigo-600 text-2xl" />
              </div>
            </div>
          </main>
        </div>
      </section>
    );
  }

  return (
    <section className="font-bai h-screen text-gray-700 bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155'
          },
        }}
      />
      <div className="flex">
        <main className="w-full mx-auto px-4 py-8">
          <div className="w-full mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Bonus Management
                  </h1>
                  <p className="text-sm md:text-base text-gray-500 mt-1">
                    Manage and monitor all platform bonuses
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    to="/deposit-bonus/create-bonus"
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <FaPlus /> Create Bonus
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
              {[
                { 
                  title: 'Total Bonuses', 
                  value: totalBonuses, 
                  icon: <FaGift className="text-indigo-600 text-xl" />,
                  color: 'from-indigo-500 to-indigo-600',
                  bg: 'bg-indigo-50'
                },
                { 
                  title: 'Active Bonuses', 
                  value: bonuses.filter(b => b.status === 'active').length, 
                  icon: <FaCheckCircle className="text-emerald-600 text-xl" />,
                  color: 'from-emerald-500 to-emerald-600',
                  bg: 'bg-emerald-50'
                },
                { 
                  title: 'Bonus Balance', 
                  value: bonuses.filter(b => b.balanceType === 'bonus_balance').length, 
                  icon: <FaCoins className="text-amber-600 text-xl" />,
                  color: 'from-amber-500 to-amber-600',
                  bg: 'bg-amber-50'
                },
                { 
                  title: 'Cash Balance', 
                  value: bonuses.filter(b => b.balanceType === 'cash_balance').length, 
                  icon: <FaWallet className="text-emerald-600 text-xl" />,
                  color: 'from-green-500 to-green-600',
                  bg: 'bg-emerald-50'
                },
                { 
                  title: 'Infinite Validity', 
                  value: bonuses.filter(b => b.validityType === 'infinite').length, 
                  icon: <FaInfinity className="text-green-600 text-xl" />,
                  color: 'from-green-500 to-green-600',
                  bg: 'bg-green-50'
                },
                { 
                  title: 'Public Bonuses', 
                  value: bonuses.filter(b => b.distributionType === 'public').length, 
                  icon: <FaGlobe className="text-blue-600 text-xl" />,
                  color: 'from-blue-500 to-blue-600',
                  bg: 'bg-blue-50'
                },
              ].map((stat, index) => (
                <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className={`bg-gradient-to-r ${stat.color} h-1.5 rounded-full`} style={{width: '60%'}}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaFilter className="mr-2 text-indigo-600" />
                  Filters & Search
                </h2>
                <button 
                  onClick={resetFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center transition-colors duration-200"
                >
                  Clear All Filters
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* Search Input */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                      placeholder="Search name or code..."
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                  >
                    {statusOptions.map((option, index) => (
                      <option key={index} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                  >
                    {typeOptions.map((option, index) => (
                      <option key={index} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* Distribution Type Filter */}
                <div>
                  <select
                    value={distributionFilter}
                    onChange={(e) => setDistributionFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                  >
                    {distributionOptions.map((option, index) => (
                      <option key={index} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* Balance Type Filter */}
                <div>
                  <select
                    value={balanceFilter}
                    onChange={(e) => setBalanceFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                  >
                    {balanceTypeOptions.map((option, index) => (
                      <option key={index} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* NEW: Validity Type Filter */}
                <div>
                  <select
                    value={validityFilter}
                    onChange={(e) => setValidityFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                  >
                    {validityTypeOptions.map((option, index) => (
                      <option key={index} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Games Category Filter */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Categories Filter
                </label>
                <div className="relative">
                  <select
                    value={gamesCategoryFilter}
                    onChange={(e) => setGamesCategoryFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                  >
                    <option value="all">All Game Categories</option>
                    {gameCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-gray-600">
              <p>
                Showing {bonuses.length} of {totalBonuses} bonuses
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm">Sort by:</span>
                <select
                  value={sortConfig.key}
                  onChange={(e) => requestSort(e.target.value)}
                  className="text-sm border-none bg-transparent focus:outline-none text-indigo-600 font-medium"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="name">Name</option>
                  <option value="amount">Amount</option>
                  <option value="validityValue">Validity</option>
                  <option value="wageringRequirement">Wagering</option>
                </select>
                <button onClick={() => requestSort(sortConfig.key)} className="text-indigo-600">
                  {sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />}
                </button>
              </div>
            </div>

            {/* Bonuses Table */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer" onClick={() => requestSort('name')}>
                        <div className="flex items-center gap-1">
                          Bonus Name {getSortIcon('name')}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Balance
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Validity
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Distribution
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer" onClick={() => requestSort('amount')}>
                        <div className="flex items-center gap-1">
                          Value {getSortIcon('amount')}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Games
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer" onClick={() => requestSort('createdAt')}>
                        <div className="flex items-center gap-1">
                          Created {getSortIcon('createdAt')}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bonuses.length > 0 ? (
                      bonuses.map((bonus) => (
                        <tr key={bonus._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <span className="text-xl">{getBonusTypeIcon(bonus.bonusType)}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">{bonus.name}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <code className="font-mono bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                    {bonus.bonusCode || 'No Code'}
                                  </code>
                                  {bonus.bonusCode && (
                                    <button
                                      onClick={() => copyBonusCode(bonus.bonusCode)}
                                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                                      title="Copy code"
                                    >
                                      <FaCopy className="text-xs" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">{formatBonusType(bonus.bonusType)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getBalanceTypeIcon(bonus.balanceType)}
                              <span className={`px-2 py-1 text-xs font-medium rounded border ${getBalanceTypeColor(bonus.balanceType)}`}>
                                {formatBalanceType(bonus.balanceType)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getValidityTypeIcon(bonus.validityType)}
                              <span className={`px-2 py-1 text-xs font-medium rounded border ${getValidityTypeColor(bonus.validityType)}`}>
                                {getValidityDescription(bonus)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getDistributionIcon(bonus.distributionType)}
                              <span className={`px-2 py-1 text-xs font-medium rounded border ${getDistributionColor(bonus.distributionType)}`}>
                                {formatDistributionType(bonus.distributionType)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {getBonusValue(bonus)}
                            </div>
                            {bonus.minDeposit > 0 && (
                              <div className="text-xs text-gray-500">
                                Min: {bonus.minDeposit?.toFixed(2)} BDT
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 max-w-[150px] truncate" title={getGamesCategoriesDisplay(bonus.gamesCategory)}>
                              {getGamesCategoriesDisplay(bonus.gamesCategory)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(bonus.status)}`}>
                                {bonus.status}
                              </span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bonus.status === 'active'}
                                  onChange={() => toggleStatus(bonus._id, bonus.status)}
                                  className="sr-only peer"
                                  disabled={bonus.status === 'expired'}
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-disabled:opacity-50 peer-disabled:cursor-not-allowed peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                              </label>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">{formatDate(bonus.createdAt)}</div>
                            {bonus.endDate && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <FaCalendarAlt /> Expires: {formatDate(bonus.endDate)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                className="p-2 px-[8px] py-[7px] cursor-pointer bg-indigo-600 text-white rounded-lg text-[16px] hover:bg-indigo-700 shadow-sm transition-colors"
                                title="View details"
                                onClick={() => viewBonusDetails(bonus)}
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => openEditModal(bonus)}
                                className="p-2 px-[8px] py-[7px] cursor-pointer bg-blue-600 text-white rounded-lg text-[16px] hover:bg-blue-700 shadow-sm transition-colors"
                                title="Edit bonus"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="p-2 px-[8px] py-[7px] cursor-pointer bg-red-600 text-white rounded-lg text-[16px] hover:bg-red-700 shadow-sm transition-colors"
                                onClick={() => handleDelete(bonus._id)}
                                title="Delete bonus"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <FaGift className="text-5xl mb-3 opacity-30" />
                            <p className="text-lg font-medium text-gray-500">No bonuses found</p>
                            <p className="text-sm">Try adjusting your search or filters</p>
                            <Link
                              to="/deposit-bonus/create-bonus"
                              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              <FaPlus className="inline mr-2" /> Create Your First Bonus
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {bonuses.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, totalBonuses)}
                      </span> of{' '}
                      <span className="font-medium">{totalBonuses}</span> bonuses
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                          currentPage === 1 
                            ? 'bg-gray-50 text-gray-800 cursor-not-allowed' 
                            : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <FaTimesCircle className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this bonus? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 focus:outline-none transition-colors duration-200 cursor-pointer shadow-sm"
              >
                Delete Bonus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bonus Details Modal */}
      {showDetailsModal && selectedBonus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <FaGift className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Bonus Details</h3>
                  <p className="text-xs text-gray-500">Complete information about the bonus</p>
                </div>
              </div>
              <button onClick={closeDetailsModal} className="text-gray-400 hover:text-gray-500 cursor-pointer p-2 hover:bg-gray-100 rounded-lg">
                <FaTimes />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedBonus.name}</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <code className="text-sm font-mono bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">{selectedBonus.bonusCode || 'No Code'}</code>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(selectedBonus.status)}`}>
                    {selectedBonus.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatBonusType(selectedBonus.bonusType)}
                  </span>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getDistributionColor(selectedBonus.distributionType)}`}>
                    {formatDistributionType(selectedBonus.distributionType)}
                  </span>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getBalanceTypeColor(selectedBonus.balanceType)}`}>
                    {formatBalanceType(selectedBonus.balanceType)}
                  </span>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getValidityTypeColor(selectedBonus.validityType)}`}>
                    {getValidityDescription(selectedBonus)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaGift className="text-indigo-600" /> Bonus Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium flex items-center gap-2">
                        {getBonusTypeIcon(selectedBonus.bonusType)} {formatBonusType(selectedBonus.bonusType)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Balance Type:</span>
                      <span className="font-medium flex items-center gap-2">
                        {getBalanceTypeIcon(selectedBonus.balanceType)} {formatBalanceType(selectedBonus.balanceType)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Distribution:</span>
                      <span className="font-medium flex items-center gap-2">
                        {getDistributionIcon(selectedBonus.distributionType)} {formatDistributionType(selectedBonus.distributionType)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Bonus Value:</span>
                      <span className="font-medium text-emerald-600">{getBonusValue(selectedBonus)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Min Deposit:</span>
                      <span className="font-medium">{selectedBonus.minDeposit?.toFixed(2) || '0.00'} BDT</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaHourglass className="text-purple-600" /> Validity & Requirements
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Validity Type:</span>
                      <span className="font-medium flex items-center gap-2">
                        {getValidityTypeIcon(selectedBonus.validityType)} {formatValidityType(selectedBonus.validityType)}
                      </span>
                    </div>
                    {selectedBonus.validityType !== 'infinite' && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Validity Duration:</span>
                        <span className="font-medium">{getValidityDescription(selectedBonus)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Wagering Requirement:</span>
                      <span className="font-medium text-blue-600">{selectedBonus.wageringRequirement}x</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">{formatDate(selectedBonus.startDate)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium">{selectedBonus.endDate ? formatDate(selectedBonus.endDate) : 'No expiry'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Games Category Section */}
              <div className="mb-6 bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaGamepad className="text-purple-600" /> Applicable Game Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBonus.gamesCategory?.includes('all') ? (
                    <div className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2 bg-purple-100 text-purple-800 border-purple-200`}>
                      <span>🎮</span>
                      <span>All Games</span>
                    </div>
                  ) : (
                    selectedBonus.gamesCategory?.map(categoryId => {
                      const category = gameCategories.find(cat => cat.id === categoryId);
                      return (
                        <div
                          key={categoryId}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2 ${category?.color || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                        >
                          <span>{category?.icon || '🎮'}</span>
                          <span>{category?.name || categoryId}</span>
                        </div>
                      );
                    })
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  {selectedBonus.gamesCategory?.includes('all') 
                    ? 'Bonus applicable to all games'
                    : `Bonus applicable to ${selectedBonus.gamesCategory?.length || 0} game categories`
                  }
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaChartLine className="text-purple-600" /> Usage Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedBonus.claimCount || 0}</div>
                    <div className="text-xs text-blue-700 mt-1">Total Claims</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">
                      {selectedBonus.distributionType === 'public' ? (
                        selectedBonus.maxClaims || '∞'
                      ) : selectedBonus.distributionType === 'private' ? (
                        selectedBonus.assignedUsers?.length || 0
                      ) : (
                        1
                      )}
                    </div>
                    <div className="text-xs text-emerald-700 mt-1">
                      {selectedBonus.distributionType === 'public' ? 'Max Claims' : 
                       selectedBonus.distributionType === 'private' ? 'Assigned Users' : 'Single User'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedBonus.reusable ? 'Yes' : 'No'}
                    </div>
                    <div className="text-xs text-purple-700 mt-1">Reusable</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">
                      {getValidityDescription(selectedBonus)}
                    </div>
                    <div className="text-xs text-amber-700 mt-1">Validity</div>
                  </div>
                </div>
              </div>

            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end sticky bottom-0 rounded-b-xl">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 focus:outline-none transition-colors duration-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Bonus Modal */}
      {showAssignModal && selectedBonus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <FaUserCheck className="text-emerald-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Assign Bonus to User</h3>
                <p className="text-xs text-gray-500">Manually assign this bonus to a specific user</p>
              </div>
            </div>
            <form onSubmit={handleAssignBonus}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={assignUserId}
                    onChange={(e) => setAssignUserId(e.target.value)}
                    placeholder="Enter user ID"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bonus Amount (Optional)
                  </label>
                  <input
                    type="number"
                    value={assignAmount}
                    onChange={(e) => setAssignAmount(e.target.value)}
                    placeholder="Leave blank to use default amount"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={assignReason}
                    onChange={(e) => setAssignReason(e.target.value)}
                    placeholder="Reason for manual assignment"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 focus:outline-none transition-colors duration-200 cursor-pointer shadow-sm"
                >
                  Assign Bonus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Validate Code Modal */}
      {showValidateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FaCheckCircle className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Validate Bonus Code</h3>
                <p className="text-xs text-gray-500">Check bonus code validity for a specific user</p>
              </div>
            </div>
            <form onSubmit={handleValidateCode}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bonus Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={validateCode}
                    onChange={(e) => setValidateCode(e.target.value.toUpperCase())}
                    placeholder="Enter bonus code"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={validateUserId}
                    onChange={(e) => setValidateUserId(e.target.value)}
                    placeholder="Enter user ID to check eligibility"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Validation Result */}
                {validationResult && (
                  <div className={`p-4 rounded-lg border ${
                    validationResult.isValid 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {validationResult.isValid ? (
                        <>
                          <FaCheckCircle className="text-emerald-600" />
                          <span className="font-semibold text-emerald-800">Valid Bonus Code</span>
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="text-red-600" />
                          <span className="font-semibold text-red-800">Invalid Bonus Code</span>
                        </>
                      )}
                    </div>
                    {validationResult.bonus && (
                      <div className="mt-3 space-y-1 text-sm text-gray-700">
                        <p><strong>Name:</strong> {validationResult.bonus.name}</p>
                        <p><strong>Type:</strong> {formatBonusType(validationResult.bonus.bonusType)}</p>
                        <p><strong>Balance Type:</strong> {formatBalanceType(validationResult.bonus.balanceType)}</p>
                        <p><strong>Validity:</strong> {getValidityDescription(validationResult.bonus)}</p>
                        <p><strong>Value:</strong> {getBonusValue(validationResult.bonus)}</p>
                      </div>
                    )}
                    {validationResult.error && (
                      <p className="mt-2 text-sm text-red-700">{validationResult.error}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-between space-x-3">
                <button
                  type="button"
                  onClick={() => setShowValidateModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors duration-200 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 focus:outline-none transition-colors duration-200 cursor-pointer shadow-sm"
                >
                  Validate Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bonus Modal */}
      {showEditModal && editingBonus && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FaEdit className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Edit Bonus</h3>
                  <p className="text-xs text-gray-500">Update bonus details</p>
                </div>
              </div>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-500 cursor-pointer p-2 hover:bg-gray-100 rounded-lg">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FaGift className="text-indigo-600" /> Basic Information
                    </h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bonus Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bonus Code
                      </label>
                      <input
                        type="text"
                        name="bonusCode"
                        value={editFormData.bonusCode}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase font-mono"
                        placeholder="Leave blank for auto-generation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bonus Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="bonusType"
                        value={editFormData.bonusType}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="welcome">Welcome Bonus</option>
                        <option value="deposit">Deposit Bonus</option>
                        <option value="reload">Reload Bonus</option>
                        <option value="cashback">Cashback</option>
                        <option value="free_spin">Free Spins</option>
                        <option value="special">Special Bonus</option>
                        <option value="manual">Manual Bonus</option>
                      </select>
                    </div>

                    {/* Balance Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Balance Type <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditBalanceTypeChange('bonus_balance')}
                          className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                            editFormData.balanceType === 'bonus_balance'
                              ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                              : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50 text-gray-700'
                          }`}
                        >
                          <FaCoins className="text-xl" />
                          <span className="text-xs font-medium">Bonus Balance</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditBalanceTypeChange('cash_balance')}
                          className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                            editFormData.balanceType === 'cash_balance'
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                              : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700'
                          }`}
                        >
                          <FaWallet className="text-xl" />
                          <span className="text-xs font-medium">Cash Balance</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Distribution Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="distributionType"
                        value={editFormData.distributionType}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="single_user">Single User</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                  </div>

                  {/* UPDATED: Validity & Bonus Value */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FaHourglass className="text-purple-600" /> Validity & Value
                    </h4>
                    
                    {/* Validity Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Validity Type <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {validityTypes.map(type => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleEditValidityTypeChange(type.value)}
                            className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                              editFormData.validityType === type.value
                                ? `border-${type.color.split('text-')[1].split('-')[0]}-500 bg-${type.color.split('text-')[1].split('-')[0]}-50 ${type.color} shadow-sm`
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            {type.icon}
                            <span className="text-xs font-medium">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Validity Value (Conditional) */}
                    {editFormData.validityType !== 'infinite' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Validity {editFormData.validityType === 'days' ? 'Days' : 'Hours'} <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="number"
                            name="validityValue"
                            value={editFormData.validityValue}
                            onChange={handleEditChange}
                            min="1"
                            max={editFormData.validityType === 'days' ? "365" : "720"}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                          <span className="text-lg font-bold text-blue-600 whitespace-nowrap">
                            {editFormData.validityType === 'days' ? 'Days' : 'Hours'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Bonus Value */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount (BDT)
                        </label>
                        <input
                          type="number"
                          name="amount"
                          value={editFormData.amount}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          step="0.01"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Percentage (%)
                        </label>
                        <input
                          type="number"
                          name="percentage"
                          value={editFormData.percentage}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          step="0.01"
                          min="0"
                          max="500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Deposit (BDT)
                      </label>
                      <input
                        type="number"
                        name="minDeposit"
                        value={editFormData.minDeposit}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Bonus (BDT)
                      </label>
                      <input
                        type="number"
                        name="maxBonus"
                        value={editFormData.maxBonus}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        step="0.01"
                        min="0"
                        placeholder="Leave blank for no limit"
                      />
                    </div>

                    {editFormData.distributionType === 'public' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maximum Claims
                          </label>
                          <input
                            type="number"
                            name="maxClaims"
                            value={editFormData.maxClaims}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            min="1"
                            placeholder="Leave blank for unlimited"
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="reusable"
                            checked={editFormData.reusable}
                            onChange={handleEditChange}
                            className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Allow users to claim this bonus multiple times
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Games Category */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaGamepad className="text-purple-600" /> Game Categories
                  </h4>
                  
                  {/* Selected Categories Display */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {editFormData.gamesCategory?.map(categoryId => (
                        <div
                          key={categoryId}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2 ${getCategoryColor(categoryId)}`}
                        >
                          <span>{getCategoryIcon(categoryId)}</span>
                          <span>{getCategoryName(categoryId)}</span>
                          <button
                            type="button"
                            onClick={() => handleEditGameCategoryToggle(categoryId)}
                            className="ml-1 hover:text-red-600"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {editFormData.gamesCategory?.length > 0 && !editFormData.gamesCategory?.includes('all') && (
                      <p className="text-xs text-gray-500 mt-2">
                        {editFormData.gamesCategory?.length} category selected
                      </p>
                    )}
                  </div>

                  {/* Category Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowGameCategorySelector(!showGameCategorySelector)}
                      className={`w-full px-4 py-2.5 text-left border rounded-lg flex items-center justify-between ${
                        showGameCategorySelector ? 'border-blue-500' : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FaList className="text-gray-400" />
                        <span className="text-gray-700">
                          {editFormData.gamesCategory?.includes('all') 
                            ? 'All Games' 
                            : editFormData.gamesCategory?.length > 0 
                              ? `${editFormData.gamesCategory?.length} categories selected`
                              : 'Select game categories'
                          }
                        </span>
                      </div>
                      {showGameCategorySelector ? (
                        <FaChevronUp className="text-gray-400" />
                      ) : (
                        <FaChevronDown className="text-gray-400" />
                      )}
                    </button>
                    
                    {showGameCategorySelector && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
                        </div>
                        
                        <div className="p-2">
                          {filteredCategories.map(category => {
                            const isSelected = editFormData.gamesCategory?.includes(category.id);
                            return (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() => handleEditGameCategoryToggle(category.id)}
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
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-600">
                    Select which games this bonus can be used for. Select "সব গেম" for all games.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Requirements */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FaShieldAlt className="text-blue-600" /> Requirements
                    </h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wagering Requirement (x)
                      </label>
                      <input
                        type="number"
                        name="wageringRequirement"
                        value={editFormData.wageringRequirement}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FaCalendarAlt className="text-purple-600" /> Validity Period
                    </h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={editFormData.startDate}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={editFormData.endDate}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty for no expiry date
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end sticky bottom-0 rounded-b-xl space-x-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors duration-200 cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 focus:outline-none transition-colors duration-200 cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      <FaSave /> Update Bonus
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};

export default Bonuslist;