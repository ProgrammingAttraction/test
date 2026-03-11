import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiUser, FiDollarSign, FiClock, FiCreditCard, FiInfo } from 'react-icons/fi';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../common/Header';
import moment from 'moment';

const TransactionLogs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [type, setType] = useState('All');
  const [remark, setRemark] = useState('All');
  const [status, setStatus] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  
  // State for data
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Get filters from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('q') || '');
    setType(params.get('type') || 'All');
    setRemark(params.get('remark') || 'All');
    setStatus(params.get('status') || 'All');
    setPaymentMethod(params.get('paymentMethod') || 'All');
    setDateRange({
      start: params.get('startDate') || '',
      end: params.get('endDate') || '',
    });
    setPagination({
      page: parseInt(params.get('page')) || 1,
      limit: parseInt(params.get('limit')) || 10,
      total: 0,
      totalPages: 1
    });
  }, [location.search]);

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${base_url}/admin/all-transactions`, {
        params: {
          q: searchQuery,
          type: type !== 'All' ? type : undefined,
          remark: remark !== 'All' ? remark : undefined,
          status: status !== 'All' ? status : undefined,
          paymentMethod: paymentMethod !== 'All' ? paymentMethod : undefined,
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined,
          page: pagination.page,
          limit: pagination.limit
        },
      });
      
      setTransactions(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.total || 0,
        totalPages: Math.ceil((response.data.total || 0) / pagination.limit)
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [searchQuery, type, remark, status, paymentMethod, dateRange, pagination.page, pagination.limit]);

  // Handle filter submission
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (type !== 'All') params.set('type', type);
    if (remark !== 'All') params.set('remark', remark);
    if (status !== 'All') params.set('status', status);
    if (paymentMethod !== 'All') params.set('paymentMethod', paymentMethod);
    if (dateRange.start) params.set('startDate', dateRange.start);
    if (dateRange.end) params.set('endDate', dateRange.end);
    params.set('page', '1');
    params.set('limit', pagination.limit.toString());
    navigate({ search: params.toString() });
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setType('All');
    setRemark('All');
    setStatus('All');
    setPaymentMethod('All');
    setDateRange({ start: '', end: '' });
    
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', pagination.limit.toString());
    navigate({ search: params.toString() });
  };

  // Handle pagination change
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(location.search);
    params.set('page', newPage.toString());
    navigate({ search: params.toString() });
  };

  // Format amount with color based on type
  const formatAmount = (transaction) => {
    const amount = transaction.amount || 0;
    const isDeposit = transaction.payment_type?.toLowerCase() === 'deposit';
    
    return (
      <div className="flex flex-col items-end">
        <span className={`font-bold ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
          {isDeposit ? '+' : '-'}৳{amount.toFixed(2)}
        </span>
        {transaction.bonus_amount > 0 && (
          <span className="text-xs text-green-500 font-medium">
            +৳{transaction.bonus_amount.toFixed(2)} bonus
          </span>
        )}
      </div>
    );
  };

  // Format status with appropriate color
  const formatStatus = (status) => {
    const statusLower = status?.toLowerCase();
    let colorClass = 'bg-gray-100 text-gray-800';
    
    if (statusLower === 'completed') colorClass = 'bg-green-100 text-green-800';
    else if (statusLower === 'pending') colorClass = 'bg-yellow-100 text-yellow-800';
    else if (statusLower === 'failed') colorClass = 'bg-red-100 text-red-800';
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {status}
      </span>
    );
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    const { page, totalPages } = pagination;
    
    let startPage = Math.max(1, page - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    // First page button
    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 rounded-md border border-gray-300 hover:bg-indigo-50 flex items-center"
        >
          <FiChevronsLeft className="text-gray-600" />
        </button>
      );
    }
    
    // Previous page button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        className={`px-3 py-2 rounded-md border border-gray-300 ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-50'} flex items-center`}
      >
        <FiChevronLeft className="text-gray-600" />
      </button>
    );
    
    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 rounded-md border ${page === i ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:bg-indigo-50'}`}
        >
          {i}
        </button>
      );
    }
    
    // Next page button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(page + 1)}
        disabled={page >= totalPages}
        className={`px-3 py-2 rounded-md border border-gray-300 ${page >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-50'} flex items-center`}
      >
        <FiChevronRight className="text-gray-600" />
      </button>
    );
    
    // Last page button
    if (endPage < totalPages) {
      buttons.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 rounded-md border border-gray-300 hover:bg-indigo-50 flex items-center"
        >
          <FiChevronsRight className="text-gray-600" />
        </button>
      );
    }
    
    return buttons;
  };

  return (
    <section className="w-full font-bai text-gray-700 overflow-y-auto  min-h-screen">
      <Header />
      <div className="w-full p-4 md:p-6 mx-auto ">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction Logs</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor and manage all financial transactions</p>
          </div>
          <div className="text-sm text-gray-500 mt-2 md:mt-0">
            {pagination.total > 0 && (
              <span className="bg-gray-100 py-1 px-3 rounded-full">
                Showing <span className="font-medium text-indigo-600">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium text-indigo-600">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium text-indigo-600">{pagination.total}</span> transactions
              </span>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm  mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by TRX ID, name, email..."
                className="pl-10 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-12 border"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 h-12 transition-colors"
              >
                <FiFilter />
                Filters
                {(type !== 'All' || status !== 'All' || paymentMethod !== 'All' || dateRange.start || dateRange.end) && (
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </button>
              
              <button
                onClick={applyFilters}
                className="bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-700 h-12 transition-colors"
              >
                <FiSearch />
                Search
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="block w-full rounded-lg border-gray-200 shadow-sm px-[10px] focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border"
                  >
                    <option value="All">All Types</option>
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="block w-full rounded-lg border-gray-200 shadow-sm px-[10px] focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border"
                  >
                    <option value="All">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="block w-full rounded-lg border-gray-200 shadow-sm px-[10px] focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border"
                  >
                    <option value="All">All Methods</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                  <select
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="block w-full rounded-lg border-gray-200 shadow-sm px-[10px] focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border"
                  >
                    <option value="All">All Remarks</option>
                    <option value="Bonus">Bonus</option>
                    <option value="Investment">Investment</option>
                    <option value="Referral">Referral</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="block w-full rounded-lg border-gray-200 shadow-sm px-[10px] focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="block w-full rounded-lg border-gray-200 shadow-sm px-[10px] focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 h-10 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto border-[1px] border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-cyan-600 text-white">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                    TRX ID
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                    Balance
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                    Type/Method
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                      </div>
                      <p className="mt-2 text-gray-500">Loading transactions...</p>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FiInfo className="text-gray-400 text-3xl mb-2" />
                        <p className="text-gray-500 font-medium">No transactions found</p>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr 
                      key={tx._id} 
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FiUser className="text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{tx.customer_name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{tx.customer_email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {tx.transaction_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {moment(tx.createdAt).format("MMM D, YYYY")}
                        </div>
                        <div className="text-sm text-gray-500">
                          {moment(tx.createdAt).format("h:mm:ss A")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatAmount(tx)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          ৳{(tx.post_balance || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {tx.payment_type}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <FiCreditCard className="text-gray-400 mr-1" />
                          {tx.payment_method}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatStatus(tx.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {tx.transaction_note || 'N/A'}
                        </div>
                        {tx.gateway_response?.paymentId && (
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            Ref: {tx.gateway_response.paymentId}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="bg-white px-4 py-4 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px gap-1" aria-label="Pagination">
                    {renderPaginationButtons()}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TransactionLogs;