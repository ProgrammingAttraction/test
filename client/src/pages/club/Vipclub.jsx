import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/header/Header';
import Sidebar from '../../components/sidebar/Sidebar';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { GlobeAltIcon, StarIcon, GiftIcon, ShieldCheckIcon, ClockIcon, TicketIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { LanguageContext } from '../../context/LanguageContext';

const Vipclub = () => {
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
  const levels = [
    {
      name: t.vipLevelBronze,
      requirements: t.vipLevelBronzeReq,
      benefits: [
        t.vipLevelBronzeBenefit1,
        t.vipLevelBronzeBenefit2,
        t.vipLevelBronzeBenefit3
      ]
    },
    {
      name: t.vipLevelSilver,
      requirements: t.vipLevelSilverReq,
      benefits: [
        t.vipLevelSilverBenefit1,
        t.vipLevelSilverBenefit2,
        t.vipLevelSilverBenefit3,
        t.vipLevelSilverBenefit4
      ]
    },
    {
      name: t.vipLevelGold,
      requirements: t.vipLevelGoldReq,
      benefits: [
        t.vipLevelGoldBenefit1,
        t.vipLevelGoldBenefit2,
        t.vipLevelGoldBenefit3,
        t.vipLevelGoldBenefit4,
        t.vipLevelGoldBenefit5
      ]
    },
    {
      name: t.vipLevelPlatinum,
      requirements: t.vipLevelPlatinumReq,
      benefits: [
        t.vipLevelPlatinumBenefit1,
        t.vipLevelPlatinumBenefit2,
        t.vipLevelPlatinumBenefit3,
        t.vipLevelPlatinumBenefit4,
        t.vipLevelPlatinumBenefit5,
        t.vipLevelPlatinumBenefit6
      ]
    }
  ];

  const benefits = [
    {
      icon: <StarIcon className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500" />,
      title: t.vipBenefitExclusiveBonuses,
      description: t.vipBenefitExclusiveBonusesDesc
    },
    {
      icon: <GiftIcon className="h-8 w-8 sm:h-10 sm:w-10 text-purple-500" />,
      title: t.vipBenefitPersonalGifts,
      description: t.vipBenefitPersonalGiftsDesc
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-500" />,
      title: t.vipBenefitHigherLimits,
      description: t.vipBenefitHigherLimitsDesc
    },
    {
      icon: <ClockIcon className="h-8 w-8 sm:h-10 sm:w-10 text-green-500" />,
      title: t.vipBenefitFasterWithdrawals,
      description: t.vipBenefitFasterWithdrawalsDesc
    },
    {
      icon: <TicketIcon className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />,
      title: t.vipBenefitExclusiveEvents,
      description: t.vipBenefitExclusiveEventsDesc
    },
    {
      icon: <UserCircleIcon className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />,
      title: t.vipBenefitPersonalManager,
      description: t.vipBenefitPersonalManagerDesc
    }
  ];

  const faqs = [
    {
      question: t.vipFaqJoin,
      answer: t.vipFaqJoinAnswer
    },
    {
      question: t.vipFaqLevels,
      answer: t.vipFaqLevelsAnswer
    },
    {
      question: t.vipFaqBenefits,
      answer: t.vipFaqBenefitsAnswer
    },
    {
      question: t.vipFaqLoseStatus,
      answer: t.vipFaqLoseStatusAnswer
    }
  ];

  return (
    <section className="min-h-screen font-anek pb-[90px] md:pb-0 bg-white text-gray-800">
      <Header 
        className="bg-white border-b border-gray-200 shadow-sm"
        showPopup={showPopup}
        setShowPopup={setShowPopup}
        activeLeftTab={activeLeftTab}
        setActiveLeftTab={setActiveLeftTab}
      />
      
      <div className="flex w-full">
        <div className="hidden md:block">
          <Sidebar 
            showPopup={showPopup}
            setShowPopup={setShowPopup}
            activeLeftTab={activeLeftTab}
            setActiveLeftTab={setActiveLeftTab}
          />
        </div>

        <div className="ml-0 md:ml-[330px] flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-50 to-yellow-50 rounded-xl p-6 sm:p-8 md:p-10 lg:p-12 mb-10 sm:mb-14 md:mb-16 border border-gray-200 shadow-sm">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-800">{t.vipHeroTitle}</h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl">{t.vipHeroText}</p>
              <button className="px-6 py-2 sm:px-8 sm:py-3 text-sm sm:text-base md:text-lg bg-gradient-to-r from-purple-600 to-yellow-500 text-white rounded-lg font-bold hover:from-purple-700 hover:to-yellow-600 transition-all shadow-md">
                {t.vipCtaButton}
              </button>
            </div>

            {/* VIP Levels Section */}
            <div className="mb-12 sm:mb-16 md:mb-20">
              <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 md:mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-yellow-500">
                {t.vipLevelsTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                {levels.map((level, index) => (
                  <div key={index} className={`bg-white p-4 sm:p-5 md:p-6 rounded-xl border-2 shadow-md hover:shadow-lg transition-all ${
                    index === 0 ? 'border-yellow-500' : 
                    index === 1 ? 'border-gray-300' : 
                    index === 2 ? 'border-yellow-400' : 
                    'border-purple-400'
                  }`}>
                    <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${
                      index === 0 ? 'text-yellow-600' : 
                      index === 1 ? 'text-gray-600' : 
                      index === 2 ? 'text-yellow-600' : 
                      'text-purple-600'
                    }`}>
                      {level.name}
                    </h3>
                    <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base text-gray-700">{t.vipRequirements}</h4>
                      <p className="text-sm sm:text-base text-gray-600">{level.requirements}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-sm sm:text-base text-gray-700">{t.vipBenefits}</h4>
                      <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                        {level.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-2 mt-1 text-purple-500">•</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits Section */}
            <div className="mb-12 sm:mb-16 md:mb-20">
              <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 md:mb-12 text-center text-gray-800">
                {t.vipBenefitsTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-gray-200 hover:border-purple-400 transition-all shadow-sm hover:shadow-md">
                    <div className="mb-3 sm:mb-4">
                      {benefit.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-gray-800">{benefit.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-12 sm:mb-16 md:mb-20">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-gray-800">{t.vipFaqTitle}</h2>
              <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <button
                      className="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                      onClick={() => toggleFAQ(index)}
                    >
                      <span className="font-medium text-sm sm:text-base md:text-lg text-gray-800">{faq.question}</span>
                      {activeIndex === index ? (
                        <ChevronUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                      )}
                    </button>
                    {activeIndex === index && (
                      <div className="px-4 sm:px-5 md:px-6 pb-3 sm:pb-4 pt-1 sm:pt-2 text-xs sm:text-sm text-gray-600 bg-gray-50 border-t border-gray-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-purple-50 to-yellow-50 rounded-xl p-6 sm:p-8 md:p-10 lg:p-12 border border-gray-200 shadow-sm">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-center text-gray-800">{t.vipCtaSectionTitle}</h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 text-center max-w-3xl mx-auto">{t.vipCtaSectionText}</p>
              <div className="text-center">
                <button className="px-6 py-2 sm:px-8 sm:py-3 text-sm sm:text-base md:text-lg bg-gradient-to-r from-purple-600 to-yellow-500 text-white rounded-lg font-bold hover:from-purple-700 hover:to-yellow-600 transition-all shadow-md">
                  {t.vipCtaButton}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vipclub;