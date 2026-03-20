import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/home/Home'
import Invitefriends from './components/mobile/invite/invitefriends'
import Account from './components/mobile/acocunt/Account'
import Hotgames from './pages/games/Hotgames'
import Livegames from './pages/games/Livegames'
import Profile from './pages/profile/Profile'
import Deposit from './pages/deposit/Deposit'
import Withdraw from './pages/withdraw/Withdraw'
import Referel from './pages/refer/Referel'
import FAQ from './pages/faq/FAQ'
import Affiliateprogramme from './pages/affiliate/Affiliateprogramme'
import Vipclub from './pages/club/Vipclub'
import GameProviders from './components/provider/GameProviders'
import Contact from './pages/contact/Contact'
import { useUser } from './context/UserContext'
import Gamepage from './components/games/gamepage/Gamepage'
import MobileInformation from "./pages/profile/mobileinformation/MobileInformation"
import PasswordInformation from './pages/profile/passwordinformation/PasswordInformation'
import Gitpage from './pages/profile/gift/Gitpage'
import Accountrecord from './pages/profile/accountrecord/Accountrecord'
import Bettingrecord from './pages/profile/bettingrecord/Bettingrecord'
import ProfileInformation from "./pages/profile/profileinformation/ProfileInformation"
import Slotgames from './pages/games/slot/Slotgames'
import Casinogames from './pages/games/casino/Casinogames'
import Allgames from './pages/games/allgames/Allgames'
import logo from "./assets/logo.png"
import Populargames from './pages/games/popular/Populargames'
import Bonusreward from './pages/profile/bonusreward/Bonusreward'
import KYCVerification from './pages/profile/KYCVerification'
import CallbackPage from './pages/callback/CallbackPage'
import KYCcallback from './pages/kyccallback/KYCcallback'
import KYCPage from './pages/kyc/KYCPage'
import TransactionPassword from './pages/profile/transactionpassword/TransactionPassword'
import TransactionPasswordReset from './pages/profile/passwordreset/TransactionPasswordReset'
import ProviderGames from './components/providergames/ProviderGames'
// ----------updated-------------
// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { userData } = useUser();
  
  if (!userData) {
    // User not logged in, redirect to home page
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { userData, loading, error, fetchUserData } = useUser();

  useEffect(() => {
    const handleLoad = () => {
      setIsLoading(false)
    }

    if (document.readyState === 'complete') {
      setIsLoading(false)
    } else {
      window.addEventListener('load', handleLoad)
      
      const timeoutId = setTimeout(() => {
        setIsLoading(false)
      }, 5000)

      return () => {
        window.removeEventListener('load', handleLoad)
        clearTimeout(timeoutId)
      }
    }
  }, [])

const Loader = () => {
  return (
    <>
      {/* Styles for the spinning animation and layered segments */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .shadow-teal {
          filter: drop-shadow(0 0 12px rgba(45, 212, 191, 0.7));
        }
        .shadow-indigo {
          filter: drop-shadow(0 0 12px rgba(99, 102, 241, 0.7));
        }
        .shadow-pink {
          filter: drop-shadow(0 0 12px rgba(236, 72, 153, 0.7));
        }
      `}</style>

      {/* Full-screen overlay with light gray background */}
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 z-[1000000000]">
        <div className="relative flex flex-col items-center justify-center">
          {/* Main container for the concentric, spinning circles */}
          <div className="relative w-[150px] h-[150px] md:w-[200px] md:h-[200px]">
            {/* The three segments of the circle with wider borders and new colors */}
            <div className="absolute inset-0 border-8 border-solid border-transparent border-t-teal-500 rounded-full animate-[spin_2s_linear_infinite] shadow-teal scale-[0.8]"></div>
            <div className="absolute inset-0 border-8 border-solid border-transparent border-l-indigo-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse] scale-[0.8] shadow-indigo"></div>
            <div className="absolute inset-0 border-8 border-solid border-transparent border-b-pink-500 rounded-full animate-[spin_1s_linear_infinite] scale-[0.8] shadow-pink"></div>
          </div>
          
          {/* Loading text in the center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img className='w-20 md:w-28' src={logo} alt="" />
          </div>
        </div>
      </div>
    </>
  );
};

  return (
    <BrowserRouter>
      {isLoading && <Loader />}
            <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/casino-games" element={<Casinogames />} />
        <Route exact path="/slot-games" element={<Slotgames />} />
        <Route exact path="/all-games" element={<Allgames />} />

        {/* Protected Routes */}
        <Route exact path="/my-account" element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />
        <Route exact path="/provider-games" element={<ProviderGames />} />
        
        <Route exact path="/hot-games" element={<Hotgames />} />
        <Route exact path="/live-games" element={<Livegames />} />
        <Route exact path="/single-game" element={<Gamepage />} />
        <Route exact path="/popular-game" element={<Populargames />} />
        <Route exact path="/api/payment/callback" element={<CallbackPage />} />
        <Route exact path="/callback-payment" element={<CallbackPage />} />

        <Route exact path="/profile" element={
            <Profile />
        } />
        
        <Route exact path="/deposit" element={
          <ProtectedRoute>
            <Deposit />
          </ProtectedRoute>
        } />

        <Route exact path="/withdraw" element={
          <ProtectedRoute>
            <Withdraw />
          </ProtectedRoute>
        } />
        
        <Route exact path="/refer-programme" element={
          <ProtectedRoute>
            <Referel />
          </ProtectedRoute>
        } />
              <Route exact path="/profile-information" element={
          <ProtectedRoute>
            <ProfileInformation />
          </ProtectedRoute>
        } />
               <Route exact path="/mobile-information" element={
          <ProtectedRoute>
            <MobileInformation />
          </ProtectedRoute>
        } />
             <Route exact path="/password-information" element={
          <ProtectedRoute>
            <PasswordInformation />
          </ProtectedRoute>
        } />

                 <Route exact path="/trx-password-update" element={
          <ProtectedRoute>
            <TransactionPassword />
          </ProtectedRoute>
        } />

                      <Route exact path="/reset-trx-password" element={
          <ProtectedRoute>
            <TransactionPasswordReset />
          </ProtectedRoute>
        } />
               <Route exact path="/my-gifts" element={
          <ProtectedRoute>
            <Gitpage />
          </ProtectedRoute>
        } />
                    <Route exact path="/kyc" element={
          <ProtectedRoute>
            <KYCPage />
          </ProtectedRoute>
        } />
              <Route exact path="/account-history" element={
          <ProtectedRoute>
            <Accountrecord />
          </ProtectedRoute>
        } />
              <Route exact path="/betting-history" element={
          <ProtectedRoute>
            <Bettingrecord />
          </ProtectedRoute>
        } />
          <Route exact path="/kyc-verification" element={
          <ProtectedRoute>
            <KYCVerification />
          </ProtectedRoute>
        } />
        <Route exact path="/bonus-rewards" element={
          <ProtectedRoute>
            <Bonusreward />
          </ProtectedRoute>
        } />
        {/* Free routes */}
        <Route exact path="/faq-policy" element={<FAQ />} />
        <Route exact path="/user/didit-callback" element={<KYCcallback />} />

        <Route exact path="/affiliate-programme" element={<Affiliateprogramme />} />
        <Route exact path="/vip-club" element={<Vipclub />} />
        <Route exact path="/provider" element={<GameProviders />} />
        <Route exact path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App