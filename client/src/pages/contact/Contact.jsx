import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import Header from '../../components/header/Header';
import Sidebar from '../../components/sidebar/Sidebar';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  ChatBubbleBottomCenterTextIcon, 
  ShieldCheckIcon, 
  UserGroupIcon, 
  IdentificationIcon 
} from '@heroicons/react/24/outline';

const Contact = () => {
  const { language, changeLanguage, t } = useContext(LanguageContext);
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

  // Departments array using translations
  const departments = [
    {
      title: t.customerSupportTitle,
      description: t.customerSupportDesc,
      icon: <ChatBubbleBottomCenterTextIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />,
      email: t.customerSupportEmail,
      availability: t.customerSupportAvailability
    },
    {
      title: t.securityTitle,
      description: t.securityDesc,
      icon: <ShieldCheckIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />,
      email: t.securityEmail,
      availability: t.securityAvailability
    },
    {
      title: t.partnershipsTitle,
      description: t.partnershipsDesc,
      icon: <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />,
      email: t.partnershipsEmail,
      availability: t.partnershipsAvailability
    },
    {
      title: t.agentTitle,
      description: t.agentDesc,
      icon: <IdentificationIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />,
      email: t.agentEmail,
      availability: t.agentAvailability
    }
  ];

  // Contact methods array using translations
  const contactMethods = [
    {
      name: t.liveChatName,
      description: t.liveChatDesc,
      icon: <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />,
      action: t.liveChatAction
    },
    {
      name: t.emailName,
      description: t.emailDesc,
      icon: <EnvelopeIcon className="h-5 w-5" />,
      action: t.emailAction
    },
    {
      name: t.phoneName,
      description: t.phoneDesc,
      icon: <PhoneIcon className="h-5 w-5" />,
      action: t.phoneAction
    }
  ];

  // FAQs array using translations
  const faqs = [
    {
      question: t.contactFaq1Question,
      answer: t.contactFaq1Answer
    },
    {
      question: t.contactFaq2Question,
      answer: t.contactFaq2Answer
    },
    {
      question: t.contactFaq3Question,
      answer: t.contactFaq3Answer
    }
  ];

  return (
    <section className="min-h-screen w-full pb-[90px] md:pb-0 font-anek bg-white text-gray-800">
      <Header 
        className="bg-white/90 backdrop-blur-sm border-b border-gray-200"
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
          {/* Page Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              {t.contactTitle}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">{t.contactSubtitle}</p>
          </div>

          {/* Contact Departments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16">
            {departments.map((dept, index) => (
              <div key={index} className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-blue-500 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 rounded-lg bg-gray-50">
                    {dept.icon}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-blue-600 mb-1">{dept.title}</h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-3">{dept.description}</p>
                    <div className="flex flex-col gap-1 sm:gap-2">
                      <a 
                        href={`mailto:${dept.email}`} 
                        className="text-xs sm:text-sm md:text-base text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1 sm:gap-2"
                      >
                        <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        {dept.email}
                      </a>
                      <p className="text-xs text-gray-500 flex items-center gap-1 sm:gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        {dept.availability}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Methods */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-gray-800">
              {t.quickContactTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {contactMethods.map((method, index) => (
                <div key={index} className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 hover:border-purple-500 transition-all shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="p-1.5 sm:p-2 rounded-full bg-gray-100">
                      {method.icon}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">{method.name}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{method.description}</p>
                  {method.name.includes(t.phoneName) ? (
                    <a href={`tel:${method.action.replace(/\s+/g, '')}`} className="w-full py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity block text-center">
                      {method.action}
                    </a>
                  ) : (
                    <button className="w-full py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity">
                      {method.action}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-gray-800">{t.faqTitle}</h2>
            <div className="space-y-3 sm:space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <button
                    className="w-full flex justify-between items-center p-4 sm:p-6 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => toggleFAQ(index)}
                  >
                    <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-800">{faq.question}</h3>
                    {activeIndex === index ? (
                      <ChevronUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    )}
                  </button>
                  {activeIndex === index && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-1 sm:pt-2 text-xs sm:text-sm text-gray-600 bg-gray-50">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 sm:mt-12 md:mt-16 bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-blue-600">
              {t.importantNotice}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              {t.securityText1}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              {t.securityText2}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;