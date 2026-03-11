import { useState } from "react";
import Header from "../common/Header";

const settingsData = [
  {
    title: "User Registration",
    description: "If you disable this module, no one can register on this system.",
    defaultEnabled: true,
  },
  {
    title: "Force SSL",
    description: "By enabling Force SSL (Secure Sockets Layer) the system will force visitors to use a secure mode.",
    defaultEnabled: false,
  },
  {
    title: "Agree Policy",
    description: "If you enable this module, users must agree to your system’s policies during registration.",
    defaultEnabled: true,
  },
  {
    title: "Force Secure Password",
    description: "By enabling this module, users must set a secure password while signing up or changing their password.",
    defaultEnabled: false,
  },
  {
    title: "KYC Verification",
    description: "If you enable KYC (Know Your Client) module, users must submit the required data.",
    defaultEnabled: false,
  },
  {
    title: "Email Verification",
    description:
      "If you enable Email Verification, users must verify their email to access the dashboard. A 6-digit verification code will be sent.",
    defaultEnabled: false,
  },
  {
    title: "Email Notification",
    description:
      "If you enable this module, the system will send emails to users where needed. Otherwise, no email will be sent.",
    note: "So be sure before disabling this module that, the system doesn’t need to send any emails.",
    defaultEnabled: true,
  },
  {
    title: "Mobile Verification",
    description:
      "If you enable Mobile Verification, users must verify their mobile to access the dashboard. A 6-digit verification code will be sent.",
    note: "Make sure that the SMS Notification module is enabled.",
    defaultEnabled: false,
  },
];

export default function Configuration() {
  const [settings, setSettings] = useState(
    settingsData.map((setting) => ({
      ...setting,
      enabled: setting.defaultEnabled,
    }))
  );

  const toggleSetting = (index) => {
    setSettings((prevSettings) =>
      prevSettings.map((setting, i) =>
        i === index ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  return (
   <section className="w-full font-bai">
    <Header/>
    <div className="p-6 bg-gray-100 min-h-screen w-full ">
      <h2 className="text-2xl font-semibold text-left mb-[20px] text-gray-800">System Configuration</h2>

      <div className="bg-white shadow-md rounded-md p-6 w-full ">
        {settings.map((setting, index) => (
          <div key={index} className="flex justify-between items-center py-3 border-b last:border-0">
            <div>
              <h3 className="text-lg font-medium text-gray-800">{setting.title}</h3>
              <p className="text-sm text-gray-600">{setting.description}</p>
              {setting.note && <p className="text-xs text-red-500 mt-1">{setting.note}</p>}
            </div>
            <button
              className={`px-6 py-2 rounded-md text-white text-sm font-semibold transition ${
                setting.enabled ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
              }`}
              onClick={() => toggleSetting(index)}
            >
              {setting.enabled ? "Enable" : "Disable"}
            </button>
          </div>
        ))}
      </div>
    </div>
   </section>
  );
}
