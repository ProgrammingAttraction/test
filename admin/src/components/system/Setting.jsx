import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { FaSearch, FaCog, FaBell, FaGlobe, FaDesktop, FaLanguage, FaImage, FaMoneyBill, FaFileAlt, FaKey, FaSignInAlt, FaClock, FaCreditCard, FaColumns, FaPuzzlePiece, FaMoneyCheckAlt } from 'react-icons/fa';
import Header from '../common/Header';

const settings = [
  { name: 'General Setting', description: 'Configure the fundamental information of the site.', icon: FaCog, route: '/settings/general-settings', slug: 'general-setting' },
  { name: 'Notification Setting', description: 'Control and configure overall notification elements of the system.', icon: FaBell, route: '/settings/notification', slug: 'notification-setting' },
  { name: 'SEO Configuration', description: 'Configure proper meta title, meta description, meta keywords, etc.', icon: FaGlobe, route: '/settings/seo-config', slug: 'seo-configuration' },
  { name: 'Manage Frontend', description: 'Control all of the frontend contents of the system.', icon: FaDesktop, route: '/frontend', slug: 'manage-frontend' },
  { name: 'Language', description: 'Configure your required languages and keywords.', icon: FaLanguage, route: '/language', slug: 'language' },
  { name: 'Logo and Favicon', description: 'Upload your logo and favicon here.', icon: FaImage, route: '/settings/logo-icon', slug: 'logo-and-favicon' },
  { name: 'Payment Gateways', description: 'Configure automatic or manual payment gateways.', icon: FaCreditCard, route: '/payment-gateways', slug: 'payment-gateways' },
  { name: 'Manage Templates', description: 'Control templates for this system.', icon: FaColumns, route: '/templates', slug: 'manage-templates' },
  { name: 'KYC Setting', description: 'Configure dynamic input fields for client information.', icon: FaKey, route: '/kyc', slug: 'kyc-setting' },
  { name: 'Extensions', description: 'Manage extensions to extend system features.', icon: FaPuzzlePiece, route: '/extensions', slug: 'extensions' },
  { name: 'System Configuration', description: 'Control basic modules of the system.', icon: FaCog, route: '/settings/system-config', slug: 'system-configuration' },
  { name: 'Withdrawals Methods', description: 'Setup withdrawal methods for payouts.', icon: FaMoneyCheckAlt, route: '/withdrawals', slug: 'withdrawals-methods' },
  { name: 'Robot Text', description: 'Insert the robots.txt content here to enhance bot web crawlers and instruct them on how to interact with certain areas of the website.', icon: FaFileAlt, route: '/settings/robot-text', slug: 'robot-text' },
  { name: 'Social Login Setting', description: 'Configure social login system information.', icon: FaSignInAlt, route: '/social-login', slug: 'social-login-setting' },
  { name: 'Cron Job Setting', description: 'Configure cron jobs to automate tasks.', icon: FaClock, route: '/cron-jobs', slug: 'cron-job-setting' }
];

const Setting = () => {
  const [search, setSearch] = React.useState('');

  const filteredSettings = settings.filter(setting =>
    setting.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
  <section className='w-full font-poppins'>
    <Header/>
        <div className="px-6 py-[10px] bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-semibold mb-4">System Settings</h2>
        <div className="relative mb-6">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredSettings.map(({ name, description, icon: Icon, route }) => (
            <NavLink to={route} key={name} className="bg-white p-4 py-[12px] flex items-center gap-4 rounded-lg shadow-md hover:shadow-xl transition">
              <div className="p-4 bg-indigo-600 text-white rounded-md">
                <Icon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">{name}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </NavLink>
          ))}
        </div>

      </div>
  </section>
  );
};

export default Setting;