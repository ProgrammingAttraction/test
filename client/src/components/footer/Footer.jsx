import React, { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import terms_file from "../../assets/terms/terms_and_conditions.pdf";
import footer_img2 from "../../assets/footer/footer_img2.png"
import footer_img3 from "../../assets/footer/footer_img3.png"
import footer_img4 from "../../assets/footer/footer_img4.png"
import footer_img1 from "../../assets/footer/footer_img1.png"

const Footer = () => {
  const { t } = useContext(LanguageContext);

  // Note: Ensure these keys exist in your translation file or replace with hardcoded strings
  return (
    <footer className="bg-[#f3f3f3] font-anek text-[#666] px-6 py-12  border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-12 mb-10">
          
          {/* Column 1: Casino */}
          <div>
            <h3 className="text-[16px] md:text-[20px] text-[#444] font-bold mb-4">Casino</h3>
            <ul className="space-y-2 text-[14px] md:text-[16px]">
              <li className="hover:text-black cursor-pointer transition-colors">Live Dealer</li>
              <li className="hover:text-black cursor-pointer transition-colors">Crazy Time</li>
              <li className="hover:text-black cursor-pointer transition-colors">Welcome bonus</li>
              <li className="hover:text-black cursor-pointer transition-colors">Tournament</li>
            </ul>
          </div>

          {/* Column 2: Company Information */}
          <div>
            <h3 className="text-[16px] md:text-[20px] text-[#444] font-bold mb-4">Company Information</h3>
            <ul className="space-y-2 text-[14px] md:text-[16px]">
              <li className="hover:text-black cursor-pointer transition-colors">Company</li>
              <li className="hover:text-black cursor-pointer transition-colors">KYC & AML Policy</li>
              <li className="hover:text-black cursor-pointer transition-colors">Privacy and Security</li>
              <li className="hover:text-black cursor-pointer transition-colors">T&C</li>
              <li className="hover:text-black cursor-pointer transition-colors">Responsible gaming</li>
              <li className="hover:text-black cursor-pointer transition-colors">Cookies Policy</li>
            </ul>
          </div>
        </div>

        {/* Middle Section: Compliance Logos */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
          {/* Replace src with your actual local or hosted assets */}
          <img src={footer_img2} alt="RGC" className="h-6 md:h-10" />
          <img src={footer_img3} alt="BeGambleAware" className="h-6 md:h-10" />
               <img src={footer_img4} alt="BeGambleAware" className="h-6 md:h-10" />
          <img src={footer_img1} alt="BeGambleAware" className="h-6 md:h-10" />
        </div>

        {/* Bottom Section: Description Text */}
        <div className="max-w-4xl mx-auto text-center mb-[50px]">
          <p className="text-[13px] leading-relaxed text-[#555]">
            A leading online gaming platform. We offer our users the thrill of live casino games, 
            exciting slot games, strategic chess, engaging fishing games, lottery, and complete 
            sports betting opportunities. As an internationally licensed and regulated operator, 
            we ensure a safe, fair, and high-quality gaming environment. Your entertainment is our top priority.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;