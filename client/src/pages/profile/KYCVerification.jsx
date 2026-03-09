import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaIdCard, FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowLeft, FaUpload, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { MdArrowBackIosNew } from "react-icons/md";
import { LanguageContext } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';

const KYCVerification = () => {
    const { t } = useContext(LanguageContext);
    const { userData } = useUser();
    const navigate = useNavigate();
    const base_url = import.meta.env.VITE_API_KEY_Base_URL;

    const [kycStatus, setKycStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form states
    const [fullLegalName, setFullLegalName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [voterIdNumber, setVoterIdNumber] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [documentType, setDocumentType] = useState('national_id');
    const [documentFile, setDocumentFile] = useState(null);

    useEffect(() => {
        fetchKYCStatus();
    }, []);

    const fetchKYCStatus = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${base_url}/user/kyc/status/${userData._id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.data.success) {
                setKycStatus(response.data.data);
                // Pre-fill form if KYC info exists
                if (response.data.data.kycInfo) {
                    const info = response.data.data.kycInfo;
                    setFullLegalName(info.fullLegalName || '');
                    setDateOfBirth(info.dateOfBirth ? new Date(info.dateOfBirth).toISOString().split('T')[0] : '');
                    setVoterIdNumber(info.voterIdNumber || '');
                    if (info.permanentAddress) {
                        setAddressLine1(info.permanentAddress.addressLine1 || '');
                        setCity(info.permanentAddress.city || '');
                        setState(info.permanentAddress.state || '');
                        setPostalCode(info.permanentAddress.postalCode || '');
                    }
                }
                setPhoneNumber(userData.phone || '');
            }
        } catch (err) {
            setError(t.kycFetchError || 'Failed to fetch KYC status');
            console.error("Error fetching KYC status:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartVerification = async () => {
        try {
            setSubmitting(true);
            const response = await axios.post(`${base_url}/user/kyc/start-verification`, {
                userId: userData._id
            }, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                }
            });

            if (response.data.success && response.data.sessionUrl) {
                // Open Didit verification in new tab
                window.open(response.data.sessionUrl, '_blank');
                setSuccess(t.kycVerificationStarted || 'Verification started. Please complete the process in the new window.');
                // Refresh status after 5 seconds
                setTimeout(fetchKYCStatus, 5000);
            }
        } catch (err) {
            setError(err.response?.data?.message || t.kycStartError || 'Failed to start verification');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitKYCInfo = async (e) => {
        e.preventDefault();
        
        if (!fullLegalName || !dateOfBirth || !voterIdNumber || !addressLine1 || !city || !state) {
            setError(t.kycRequiredFields || 'Please fill all required fields');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            
            const permanentAddress = JSON.stringify({
                addressLine1,
                city,
                state,
                postalCode,
                country: 'Bangladesh'
            });

            const response = await axios.post(`${base_url}/user/kyc/submit-info`, {
                userId: userData._id,
                fullLegalName,
                dateOfBirth,
                voterIdNumber,
                permanentAddress,
                phoneNumber
            }, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                }
            });

            if (response.data.success) {
                setSuccess(t.kycInfoSubmitted || 'KYC information submitted successfully');
                fetchKYCStatus();
            }
        } catch (err) {
            setError(err.response?.data?.message || t.kycSubmitError || 'Failed to submit KYC information');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDocumentUpload = async (e) => {
        e.preventDefault();
        
        if (!documentFile) {
            setError(t.kycSelectDocument || 'Please select a document to upload');
            return;
        }

        const formData = new FormData();
        formData.append('document', documentFile);
        formData.append('userId', userData._id);
        formData.append('documentType', documentType);

        try {
            setSubmitting(true);
            const response = await axios.post(`${base_url}/user/kyc/upload-document`, formData, {
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setSuccess(t.kycDocumentUploaded || 'Document uploaded successfully');
                setDocumentFile(null);
            }
        } catch (err) {
            setError(err.response?.data?.message || t.kycUploadError || 'Failed to upload document');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = () => {
        switch (kycStatus?.kycStatus) {
            case 'verified':
                return <FaCheckCircle className="text-green-500 text-4xl" />;
            case 'pending':
            case 'verification_pending':
                return <FaSpinner className="text-yellow-500 text-4xl animate-spin" />;
            case 'rejected':
                return <FaTimesCircle className="text-red-500 text-4xl" />;
            default:
                return <FaIdCard className="text-gray-400 text-4xl" />;
        }
    };

    const getStatusMessage = () => {
        switch (kycStatus?.kycStatus) {
            case 'verified':
                return t.kycVerifiedMessage || 'Your identity has been successfully verified.';
            case 'pending':
                return t.kycPendingMessage || 'Your KYC application is under review.';
            case 'verification_pending':
                return t.kycVerificationPendingMessage || 'Please complete the verification process.';
            case 'rejected':
                return t.kycRejectedMessage || 'Your KYC application was rejected. Please try again.';
            default:
                return t.kycNotVerifiedMessage || 'Complete KYC verification to unlock all features.';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-950">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#101828] text-gray-100 min-h-screen font-anek">
            {/* Header */}
            <div className="backdrop-blur-sm bg-gray-900/80 px-4 py-3 flex items-center justify-between border-b border-cyan-800/50 sticky top-0 z-50">
                <button
                    onClick={() => navigate("/profile")}
                    className="p-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors duration-300"
                >
                    <FaArrowLeft className="text-lg text-cyan-400" />
                </button>
                <h1 className="text-xl font-extrabold text-white tracking-widest uppercase">
                    {t.kycVerification || "KYC Verification"}
                </h1>
                <div className="w-8 h-8"></div>
            </div>

            <div className="p-4 max-w-4xl mx-auto">
                {/* Status Banner */}
                <div className="bg-gray-800/70 backdrop-blur-md p-6 rounded-xl border border-cyan-700/50 mb-6">
                    <div className="flex items-center gap-4">
                        {getStatusIcon()}
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-white mb-2">
                                {t.kycStatus || "KYC Status"}:
                                <span className={`ml-2 ${
                                    kycStatus?.kycStatus === 'verified' ? 'text-green-400' :
                                    kycStatus?.kycStatus === 'rejected' ? 'text-red-400' :
                                    'text-yellow-400'
                                }`}>
                                    {kycStatus?.kycStatus?.toUpperCase() || 'NOT VERIFIED'}
                                </span>
                            </h2>
                            <p className="text-gray-300">{getStatusMessage()}</p>
                            
                            {kycStatus?.kycStatus === 'verification_pending' && kycStatus?.latestVerification?.sessionUrl && (
                                <button
                                    onClick={() => window.open(kycStatus.latestVerification.sessionUrl, '_blank')}
                                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-bold transition-colors"
                                >
                                    {t.continueVerification || "Continue Verification"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-100">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="mb-4 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-100">
                        {success}
                    </div>
                )}

                {/* Requirements Section */}
                {(!kycStatus || kycStatus.kycStatus === 'unverified' || kycStatus.kycStatus === 'rejected') && (
                    <>
                        <div className="bg-gray-800/50 p-6 rounded-xl mb-6">
                            <h3 className="text-lg font-bold text-cyan-400 mb-4">{t.kycRequirements || "Requirements"}</h3>
                            <ul className="space-y-2 text-gray-300">
                                <li className="flex items-center">
                                    <FaCheckCircle className="text-green-500 mr-2" />
                                    {t.kycRequirement1 || "Valid Government ID (NID/Passport)"}
                                </li>
                                <li className="flex items-center">
                                    <FaCheckCircle className="text-green-500 mr-2" />
                                    {t.kycRequirement2 || "Proof of Address"}
                                </li>
                                <li className="flex items-center">
                                    <FaCheckCircle className="text-green-500 mr-2" />
                                    {t.kycRequirement3 || "Selfie with ID"}
                                </li>
                            </ul>
                        </div>

                        {/* KYC Information Form */}
                        <form onSubmit={handleSubmitKYCInfo} className="bg-gray-800/50 p-6 rounded-xl mb-6">
                            <h3 className="text-lg font-bold text-cyan-400 mb-4">{t.kycPersonalInfo || "Personal Information"}</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        <FaUser className="inline mr-2" />
                                        {t.fullLegalName || "Full Legal Name"} *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        value={fullLegalName}
                                        onChange={(e) => setFullLegalName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        <FaCalendarAlt className="inline mr-2" />
                                        {t.dateOfBirth || "Date of Birth"} *
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        <FaIdCard className="inline mr-2" />
                                        {t.voterIdNumber || "Voter ID/NID Number"} *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        value={voterIdNumber}
                                        onChange={(e) => setVoterIdNumber(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        <FaPhone className="inline mr-2" />
                                        {t.phoneNumber || "Phone Number"} *
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    <FaMapMarkerAlt className="inline mr-2" />
                                    {t.permanentAddress || "Permanent Address"} *
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent mb-2"
                                    placeholder="Address Line 1"
                                    value={addressLine1}
                                    onChange={(e) => setAddressLine1(e.target.value)}
                                    required
                                />
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <input
                                        type="text"
                                        className="p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        placeholder="City"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="text"
                                        className="p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        placeholder="State/Division"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="text"
                                        className="p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        placeholder="Postal Code"
                                        value={postalCode}
                                        onChange={(e) => setPostalCode(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-4 rounded-lg font-bold transition-colors disabled:opacity-50"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center">
                                        <FaSpinner className="animate-spin mr-2" />
                                        {t.submitting || "Submitting..."}
                                    </span>
                                ) : (
                                    t.submitKYCInfo || "Submit KYC Information"
                                )}
                            </button>
                        </form>

                        {/* Document Upload Section */}
                        <form onSubmit={handleDocumentUpload} className="bg-gray-800/50 p-6 rounded-xl mb-6">
                            <h3 className="text-lg font-bold text-cyan-400 mb-4">{t.uploadDocuments || "Upload Documents"}</h3>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t.documentType || "Document Type"}
                                </label>
                                <select
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    value={documentType}
                                    onChange={(e) => setDocumentType(e.target.value)}
                                >
                                    <option value="national_id">National ID Card</option>
                                    <option value="passport">Passport</option>
                                    <option value="drivers_license">Driver's License</option>
                                    <option value="utility_bill">Utility Bill</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <FaUpload className="inline mr-2" />
                                    {t.selectDocument || "Select Document"}
                                </label>
                                <input
                                    type="file"
                                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => setDocumentFile(e.target.files[0])}
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    {t.acceptedFormats || "Accepted formats: JPG, PNG, PDF (Max 5MB)"}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !documentFile}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-bold transition-colors disabled:opacity-50"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center">
                                        <FaSpinner className="animate-spin mr-2" />
                                        {t.uploading || "Uploading..."}
                                    </span>
                                ) : (
                                    t.uploadDocument || "Upload Document"
                                )}
                            </button>
                        </form>

                        {/* Start Verification Button */}
                        <div className="text-center mt-8">
                            <p className="text-gray-400 mb-4">
                                {t.kycVerificationNote || "After submitting your information, you can start the verification process."}
                            </p>
                            
                            <button
                                onClick={handleStartVerification}
                                disabled={submitting || !kycStatus?.canStartKYC}
                                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white py-4 px-8 rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center">
                                        <FaSpinner className="animate-spin mr-2" />
                                        {t.startingVerification || "Starting Verification..."}
                                    </span>
                                ) : (
                                    t.startKYCVerification || "Start KYC Verification"
                                )}
                            </button>
                            
                            {!kycStatus?.emailVerified && (
                                <p className="text-yellow-500 mt-2">
                                    {t.emailVerificationRequired || "Please verify your email first"}
                                </p>
                            )}
                        </div>
                    </>
                )}

                {/* Already Verified Section */}
                {kycStatus?.kycStatus === 'verified' && (
                    <div className="text-center py-8">
                        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-green-400 mb-2">
                            {t.kycVerifiedSuccess || "KYC Verification Complete!"}
                        </h3>
                        <p className="text-gray-300 mb-6">
                            {t.kycVerifiedDescription || "Your identity has been successfully verified. You now have full access to all platform features."}
                        </p>
                        <button
                            onClick={() => navigate("/profile")}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                        >
                            {t.backToProfile || "Back to Profile"}
                        </button>
                    </div>
                )}

                {/* Benefits Section */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl border border-cyan-800/30">
                    <h3 className="text-lg font-bold text-white mb-4">{t.kycBenefits || "Benefits of KYC Verification"}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <div className="text-cyan-400 text-2xl mb-2">✓</div>
                            <h4 className="font-bold text-white mb-2">{t.higherLimits || "Higher Limits"}</h4>
                            <p className="text-gray-400 text-sm">
                                {t.higherLimitsDesc || "Increased deposit and withdrawal limits"}
                            </p>
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <div className="text-cyan-400 text-2xl mb-2">✓</div>
                            <h4 className="font-bold text-white mb-2">{t.fasterWithdrawals || "Faster Withdrawals"}</h4>
                            <p className="text-gray-400 text-sm">
                                {t.fasterWithdrawalsDesc || "Priority processing for withdrawals"}
                            </p>
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <div className="text-cyan-400 text-2xl mb-2">✓</div>
                            <h4 className="font-bold text-white mb-2">{t.fullAccess || "Full Access"}</h4>
                            <p className="text-gray-400 text-sm">
                                {t.fullAccessDesc || "Access to all games and features"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KYCVerification;