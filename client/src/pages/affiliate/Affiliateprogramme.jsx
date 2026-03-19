import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/header/Header';
import Sidebar from '../../components/sidebar/Sidebar';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { GlobeAltIcon, CurrencyDollarIcon, ChartBarIcon, UserGroupIcon, CreditCardIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { LanguageContext } from '../../context/LanguageContext';
import { NavLink } from 'react-router-dom';

const Affiliateprogramme = () => {
  const { t, changeLanguage, language } = useContext(LanguageContext);
  const [activeIndex, setActiveIndex] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState(t.myAccount);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const toggleLanguage = () => {
    changeLanguage(
      language.code === 'bn'
        ? { code: 'en', name: 'English', flag: 'https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/US.svg' }
        : { code: 'bn', name: 'বাংলা', flag: 'https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/BD.svg' }
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Define content using translations
  const features = [
    {
      icon: <CurrencyDollarIcon className="h-8 sm:h-10 w-8 sm:w-10 text-purple-600" />,
      title: t.affiliateFeatureHighCommission,
      description: t.affiliateFeatureHighCommissionDesc
    },
    {
      icon: <ChartBarIcon className="h-8 sm:h-10 w-8 sm:w-10 text-cyan-600" />,
      title: t.affiliateFeatureRealTimeStats,
      description: t.affiliateFeatureRealTimeStatsDesc
    },
    {
      icon: <UserGroupIcon className="h-8 sm:h-10 w-8 sm:w-10 text-green-600" />,
      title: t.affiliateFeatureMultiTier,
      description: t.affiliateFeatureMultiTierDesc
    },
    {
      icon: <CreditCardIcon className="h-8 sm:h-10 w-8 sm:w-10 text-yellow-600" />,
      title: t.affiliateFeatureRegularPayouts,
      description: t.affiliateFeatureRegularPayoutsDesc
    },
    {
      icon: <ArrowPathIcon className="h-8 sm:h-10 w-8 sm:w-10 text-red-600" />,
      title: t.affiliateFeatureLifetimeReferrals,
      description: t.affiliateFeatureLifetimeReferralsDesc
    }
  ];

  const howItWorksSteps = [
    t.affiliateHowItWorksStep1,
    t.affiliateHowItWorksStep2,
    t.affiliateHowItWorksStep3,
    t.affiliateHowItWorksStep4
  ];

  const faqs = [
    {
      question: t.affiliateFaqJoin,
      answer: t.affiliateFaqJoinAnswer
    },
    {
      question: t.affiliateFaqEarnings,
      answer: t.affiliateFaqEarningsAnswer
    },
    {
      question: t.affiliateFaqPayouts,
      answer: t.affiliateFaqPayoutsAnswer
    },
    {
      question: t.affiliateFaqMultipleAccounts,
      answer: t.affiliateFaqMultipleAccountsAnswer
    }
  ];

  return (
    <section className="min-h-screen font-anek pb-[90px] md:pb-0 bg-white text-gray-800">
      <Header 
        className="bg-white/90 backdrop-blur-sm border-b border-gray-200"
        showPopup={showPopup}
        setShowPopup={setShowPopup}
        activeLeftTab={activeLeftTab}
        setActiveLeftTab={setActiveLeftTab}
      />
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar 
            showPopup={showPopup}
            setShowPopup={setShowPopup}
            activeLeftTab={activeLeftTab}
            setActiveLeftTab={setActiveLeftTab}
          />
        </div>

        <div className="ml-0 md:ml-[330px] flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
          <div className="w-full mx-auto">
            {/* Language Toggle Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-300 text-sm sm:text-base text-gray-700"
              >
                <GlobeAltIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{language.code === 'bn' ? 'English' : 'বাংলা'}</span>
              </button>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl p-6 sm:p-8 md:p-10 lg:p-12 mb-10 sm:mb-16 border border-gray-200 shadow-sm">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-800">{t.affiliateHeroTitle}</h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl">{t.affiliateHeroText}</p>
              <NavLink target='_blank' to='https://affilinkly.com/register' className="px-6 py-2 cursor-pointer sm:px-8 sm:py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg font-bold text-base sm:text-lg hover:from-purple-700 hover:to-cyan-700 transition-all text-white inline-block">
                {t.affiliateCtaButton}
              </NavLink>
            </div>

            {/* Features Section */}
            <div className="mb-12 sm:mb-16 lg:mb-20">
              <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-purple-600">
                {t.affiliateFeaturesTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:border-cyan-400 hover:shadow-md transition-all">
                    <div className="mb-3 sm:mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-gray-800">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works Section */}
            <div className="mb-12 sm:mb-16 lg:mb-20">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-gray-800">{t.affiliateHowItWorksTitle}</h2>
              <div className="relative">
                <div className="absolute left-4 md:left-1/2 h-full w-0.5 sm:w-1 bg-gradient-to-b from-purple-400 to-cyan-400 -translate-x-1/2"></div>
                <div className="space-y-6 sm:space-y-8">
                  {howItWorksSteps.map((step, index) => (
                    <div key={index} className="relative pl-10 sm:pl-12 md:pl-0">
                      <div className="flex items-start">
                        <div className="hidden md:flex md:w-1/2 md:pr-8 lg:pr-12 md:justify-end">
                          {index % 2 === 0 && (
                            <div className="text-right pr-6 lg:pr-8 pt-1 sm:pt-2">
                              <p className="text-base sm:text-lg font-medium text-gray-700">{step}</p>
                            </div>
                          )}
                        </div>
                        <div className="absolute left-0 md:left-1/2 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 -translate-x-1/2">
                          <span className="text-white text-sm sm:text-base font-bold">{index + 1}</span>
                        </div>
                        <div className="hidden md:flex md:w-1/2 md:pl-8 lg:pl-12">
                          {index % 2 !== 0 && (
                            <div className="pl-6 lg:pl-8 pt-1 sm:pt-2">
                              <p className="text-base sm:text-lg font-medium text-gray-700">{step}</p>
                            </div>
                          )}
                        </div>
                        <div className="md:hidden pl-4 sm:pl-6 pt-0.5 sm:pt-1">
                          <p className="text-base sm:text-lg font-medium text-gray-700">{step}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-12 sm:mb-16 lg:mb-20">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-gray-800">{t.affiliateFaqTitle}</h2>
              <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <button
                      className="w-full px-4 py-3 sm:px-6 sm:py-4 text-left flex cursor-pointer justify-between items-center hover:bg-gray-50 transition-colors"
                      onClick={() => toggleFAQ(index)}
                    >
                      <span className="font-medium text-base sm:text-lg text-gray-800">{faq.question}</span>
                      {activeIndex === index ? (
                        <ChevronUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600" />
                      )}
                    </button>
                    {activeIndex === index && (
                      <div className="px-4 pb-3 pt-1 sm:px-6 sm:pb-4 sm:pt-2 text-gray-600 text-sm sm:text-base border-t border-gray-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl p-6 sm:p-8 md:p-10 lg:p-12 border border-gray-200 shadow-sm">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-center text-gray-800">{t.affiliateCtaSectionTitle}</h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 text-center max-w-3xl mx-auto">{t.affiliateCtaSectionText}</p>
              <div className="text-center">
                <NavLink target='_blank' to='https://affilinkly.com/register' className="px-6 py-2 cursor-pointer sm:px-8 sm:py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg font-bold text-base sm:text-lg hover:from-purple-700 hover:to-cyan-700 transition-all text-white inline-block">
                  {t.affiliateCtaButton}
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Affiliateprogramme;