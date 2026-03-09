/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from "react-router-dom";
import moment from "moment";

function CallbackPage() {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const base_url2 = import.meta.env.VITE_API_KEY_Base_URL2;

  const [paymentparams] = useSearchParams();
  const navigate = useNavigate();
  const user_info = JSON.parse(localStorage.getItem("user") || "null");

  const [transaction_info, set_transaction_info] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(true);
  
  // Get parameters from URL
  const transactionId = paymentparams.get("paymentID");
  const urlStatus = paymentparams.get("status"); // 'success' or 'cancel'

  // Execute payment callback function
  const executePaymentCallback = async (amount, provider, status) => {
    try {
      const response = await axios.post(`${base_url2}/api/payment/p2c/bkash/callback`, {
        payment_type: "Deposit",
        amount: amount,
        payment_method: provider,
        status: status === "cancel" ? "failed" : status,
        customer_id: user_info?._id,
        paymentID: transactionId,
      });
      console.log("Payment callback response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error processing payment callback:", error);
      return false;
    }
  };

  // Progress bar animation
  useEffect(() => {
    let interval;
    if (showProgress) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setShowProgress(false);
              user_money_info();
            }, 200);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [showProgress]);

  const user_money_info = async () => {
    if (!transactionId) return;
    
    try {
      setLoading(true);
      
      // Get transaction status
      const { data: transactionResponse } = await axios.get(
        `${base_url2}/api/payment/transaction-status/${transactionId}`
      );
      
      if (transactionResponse.success || transactionResponse._id) {
        const transactionData = transactionResponse.data || transactionResponse;
        set_transaction_info(transactionData);
        
        const amount = transactionData.expectedAmount;
        const provider = transactionData.provider;
        
        // Execute payment callback
        await executePaymentCallback(amount, provider, urlStatus);
        
        // Get updated user info if user is logged in
        if (user_info?._id) {
          const { data: userResponse } = await axios.get(
            `${base_url}/auth/user/${user_info._id}`,
            { headers: { 'Authorization': localStorage.getItem('token') } }
          );
          
          if (userResponse.success) {
            // Create transaction record
            const { data: createTransactionResponse } = await axios.post(
              `${base_url}/user/create-transaction`,
              {
                payment_type: "Deposit",
                post_balance: userResponse.user.balance,
                transaction: transactionData.paymentId,
                amount: transactionData.receivedAmount || transactionData.expectedAmount,
                payment_method: transactionData.provider,
                status: transactionData.status === "pending" 
                  ? "failed" 
                  : transactionData.status === "fully paid" 
                    ? "success" 
                    : transactionData.status,
                customer_id: user_info._id,
              }
            );
            
            if (createTransactionResponse?.transaction) {
              console.log('Transaction created:', createTransactionResponse.transaction);
              set_transaction_info(prev => ({ 
                ...prev, 
                ...createTransactionResponse.transaction 
              }));
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in user_money_info:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logic to determine what to show based on URL status vs Database status
  const getDisplayStatus = () => {
    if (urlStatus === 'cancel') return 'Cancelled';
    if (urlStatus === 'success') return 'Completed';
    return transaction_info?.status || 'Processing';
  };

  const isSuccess = urlStatus === 'success';

  if (!transactionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Invalid Transaction</h1>
          <p className="text-gray-400 mb-6">No transaction ID provided</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-anek flex flex-col justify-center items-center bg-[#0f172a] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black px-4">
      
      {showProgress ? (
        <div className="flex flex-col items-center animate-pulse">
          <h1 className="text-blue-400 font-medium text-xl mb-8 tracking-wide">
            Verifying Transaction...
          </h1>
          
          <div className="w-72 h-12 p-[6px] bg-slate-800/50 rounded-full border border-slate-700 shadow-2xl backdrop-blur-sm">
            <div className="w-full h-full rounded-full overflow-hidden flex">
              <div 
                className="h-full flex transition-all duration-300 ease-linear shadow-[0_0_15px_rgba(107,217,164,0.4)]"
                style={{ width: `${progress}%` }}
              >
                <div className="h-full w-1/5 bg-[#A0E49E]"></div>
                <div className="h-full w-1/5 bg-[#6BD9A4]"></div>
                <div className="h-full w-1/5 bg-[#96E69B]"></div>
                <div className="h-full w-1/5 bg-[#C5E8FF]"></div>
                <div className="h-full w-1/5 bg-[#B1DFFF]"></div>
              </div>
            </div>
          </div>
          
          <p className="text-slate-400 text-sm mt-4">Please wait while we process your payment...</p>
        </div>
      ) : (
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
          
          <div className="text-center mb-8">
            <div className="relative inline-flex mb-4">
              <div className={`absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse ${!isSuccess ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
              
              <div className={`relative flex items-center justify-center w-20 h-20 rounded-full border-2 ${!isSuccess ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'}`}>
                {!isSuccess ? (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" className="animate-[draw_0.4s_ease-in-out_forwards]" style={{ strokeDasharray: 50, strokeDashoffset: 50 }} />
                  </svg>
                ) : (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-[draw_0.4s_ease-in-out_forwards]" style={{ strokeDasharray: 50, strokeDashoffset: 50 }} />
                  </svg>
                )}
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white tracking-tight">
              {!isSuccess ? 'Payment Cancelled' : 'Payment Received'}
            </h1>
            <div className="mt-2 flex items-center justify-center gap-2">
              <p className="text-slate-400 text-sm font-mono tracking-wider uppercase">
                Ref: #{transactionId || 'N/A'}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 text-center">
              <div className="flex justify-center items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-white mt-4">Loading transaction details...</p>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8">
              <div className="space-y-6">

                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <div className='flex justify-start items-center gap-[15px]'>
                    <img 
                      className='w-[50px] rounded-[10px]' 
                      src="https://play-lh.googleusercontent.com/1CRcUfmtwvWxT2g-xJF8s9_btha42TLi6Lo-qVkVomXBb_citzakZX9BbeY51iholWs" 
                      alt="Payment Method" 
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Amount</p>
                      <p className="text-3xl font-bold text-white">
                        ৳ {transaction_info?.expectedAmount || transaction_info?.amount || '0.00'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400 italic">
                    {transaction_info?.createdAt ? moment(transaction_info.createdAt).format("MMM DD, h:mm A") : '--'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Method</p>
                    <p className="text-orange-400 font-medium capitalize">
                      {transaction_info?.provider || 'Bkash'}
                    </p>
                  </div>
                  <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Status</p>
                    <p className={`${!isSuccess ? 'text-red-400' : 'text-emerald-400'} font-medium capitalize`}>
                      {getDisplayStatus()}
                    </p>
                  </div>
                </div>

                {transaction_info?.paymentId && (
                  <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Transaction ID</p>
                    <p className="text-white font-mono text-sm break-all">
                      {transaction_info.paymentId}
                    </p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigate('/')}
                className={`group relative w-full mt-8 py-4 cursor-pointer font-semibold rounded-2xl transition-all shadow-lg active:scale-95 overflow-hidden ${!isSuccess ? 'bg-slate-700 hover:bg-slate-600' : 'bg-theme_color2 hover:bg-teal-500'} text-white`}
              >
                <span className="relative z-10">Return to Home</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </button>
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}} />
    </div>
  );
}

export default CallbackPage;