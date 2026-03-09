import React, { useState,useEffect,useContext } from 'react';
import Header from '../../components/header/Header';
import Sidebar from '../../components/sidebar/Sidebar';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { GlobeAltIcon } from '@heroicons/react/24/solid';
import { LanguageContext } from '../../context/LanguageContext';

// FAQ Component
const FAQ = () => {
  const { t, changeLanguage, language } = useContext(LanguageContext);
  const [activeIndex, setActiveIndex] = useState(null);
  const [activePolicyIndex, setActivePolicyIndex] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState(t.myAccount);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const togglePolicy = (index) => {
    setActivePolicyIndex(activePolicyIndex === index ? null : index);
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

  const faqs = [
    { question: t.faq1_question, answer: t.faq1_answer },
    { question: t.faq2_question, answer: t.faq2_answer },
    { question: t.faq3_question, answer: t.faq3_answer },
    { question: t.faq4_question, answer: t.faq4_answer },
    { question: t.faq5_question, answer: t.faq5_answer },
  ];

  const policies = [
    { title: t.privacyPolicy, content: t.privacyPolicyContent },
    { title: t.responsibleGaming, content: t.responsibleGamingContent },
  ];

  return (
    <section className="min-h-screen w-full md:pb-0 pb-[90px] font-anek bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <Header
        className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-700"
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
        <div className="ml-0 md:ml-[330px] flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              {t.faqTitle}
            </h1>
            <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-10">{t.faqSubtitle}</p>
            <div className="mb-12 sm:mb-20">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-cyan-400">{t.generalTitle}</h2>
              <div className="space-y-3 sm:space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
                    <button
                      className="w-full px-4 py-3 sm:px-6 sm:py-4 text-left cursor-pointer flex justify-between items-center hover:bg-gray-700/50 transition-colors"
                      onClick={() => toggleFAQ(index)}
                    >
                      <span className="font-medium text-base sm:text-lg">{faq.question}</span>
                      {activeIndex === index ? (
                        <ChevronUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                      )}
                    </button>
                    {activeIndex === index && (
                      <div className="px-4 pb-3 pt-1 sm:px-6 sm:pb-4 sm:pt-2 text-gray-300 text-sm sm:text-base">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-purple-400">{t.policiesTitle}</h2>
              <div className="space-y-3 sm:space-y-4">
                {policies.map((policy, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
                    <button
                      className="w-full px-4 py-3 sm:px-6 sm:py-4 text-left flex justify-between items-center hover:bg-gray-700/50 transition-colors"
                      onClick={() => togglePolicy(index)}
                    >
                      <span className="font-medium text-base sm:text-lg">{policy.title}</span>
                      {activePolicyIndex === index ? (
                        <ChevronUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                      )}
                    </button>
                    {activePolicyIndex === index && (
                      <div className="px-4 pb-3 pt-1 sm:px-6 sm:pb-4 sm:pt-2 text-gray-300 text-sm sm:text-base">
                        {policy.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{t.needHelp}</h3>
              <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">{t.helpText}</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a
                  href="mailto:support@genzz.casino"
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-medium text-center transition-colors text-sm sm:text-base"
                >
                  {t.emailSupport}
                </a>
                <a
                  href="/live-chat"
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium text-center transition-colors text-sm sm:text-base"
                >
                  {t.liveChat}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default FAQ;