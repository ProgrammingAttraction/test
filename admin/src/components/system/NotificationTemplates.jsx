import { useState } from "react";
import { FaEnvelope, FaMobileAlt, FaBell } from "react-icons/fa";
import Header from "../common/Header";

const NotificationTemplates = () => {
  const [activeTab, setActiveTab] = useState("email");

  const tabs = [
    { id: "email", label: "Email Template", icon: <FaEnvelope /> },
    { id: "sms", label: "SMS Template", icon: <FaMobileAlt /> },
    { id: "push", label: "Push Notification Template", icon: <FaBell /> },
  ];

  const shortcodes = [
    { code: "{{fullname}}", description: "Full Name of User" },
    { code: "{{username}}", description: "Username of User" },
    { code: "{{message}}", description: "Message" },
    { code: "{{site_name}}", description: "Name of your site" },
    { code: "{{site_currency}}", description: "Currency of your site" },
    { code: "{{currency_symbol}}", description: "Symbol of currency" },
  ];

  return (
<section className="w-full font-bai">
    <Header/>
    <div className="p-6 bg-gray-100 w-full min-h-screen">
      <div className="flex border-b border-gray-200 space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-6 py-3 flex items-center gap-2 text-[18px] font-semibold rounded-t-lg transition-all ${
              activeTab === tab.id
                ? "bg-white shadow-md text-blue-600 "
                : "text-gray-600"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800">Global {tabs.find(t => t.id === activeTab)?.label}</h2>
        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white text-sm uppercase">
                <th className="p-3">Short Code</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {shortcodes.map((item, index) => (
                <tr key={index} className="border-b border-gray-200 text-gray-700 text-sm">
                  <td className="p-3">{item.code}</td>
                  <td className="p-3">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
</section>
  );
};

export default NotificationTemplates;
