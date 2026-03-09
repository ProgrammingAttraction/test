import React, { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import terms_file from "../../assets/terms/terms_and_conditions.pdf";

const Footer = () => {
  const { t } = useContext(LanguageContext);

  return (
    <footer className="bg-gray-50 text-gray-300 px-4 sm:px-8 mt-[50px] lg:px-16 py-10 text-sm border-t border-gray-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {/* Column 1 */}
        <div>
          <h3 className="text-lg text-gray-800 font-semibold mb-2">{t.casino}</h3>
          <ul className="space-y-1 text-gray-700">
            <li className="hover:text-cyan-400 cursor-pointer transition-colors">{t.offers}</li>
            <li className="hover:text-cyan-400 cursor-pointer transition-colors">{t.missions}</li>
            <li className="hover:text-cyan-400 cursor-pointer transition-colors">{t.bonus}</li>
          </ul>
        </div>

        {/* Column 2 */}
        <div>
          <h3 className="text-lg text-gray-800 font-semibold mb-2">{t.games}</h3>
          <ul className="space-y-1 text-gray-700">
            <li className="hover:text-cyan-400 cursor-pointer transition-colors">{t.casino}</li>
            <li className="hover:text-cyan-400 cursor-pointer transition-colors">{t.fishing}</li>
            <li className="hover:text-cyan-400 cursor-pointer transition-colors">{t.poker}</li>
            <li className="hover:text-cyan-400 cursor-pointer transition-colors">{t.liveDealer}</li>
            <li className="hover:text-cyan-400 cursor-pointer transition-colors">{t.vSports}</li>
            <li className="hover:text-cyan-400 cursor-pointer transition-colors">{t.eSports}</li>
            <li className="hover:text-cyan-400 cursor-pointer transition-colors">{t.lottery}</li>
            <li className="hover:text-cyan-400 cursor-pointer transition-colors">{t.cockfight}</li>
            <li className="hover:text-cyan-400 cursor-pointer transition-colors">{t.popular}</li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h3 className="text-lg text-gray-800 font-semibold mb-2">{t.support}</h3>
          <ul className="space-y-1 text-gray-700">
            <li className="hover:text-cyan-400 cursor-pointer transition-colors">{t.customerService}</li>
            <li className="hover:text-cyan-400 cursor-pointer transition-colors">{t.faq}</li>
          </ul>
        </div>

        {/* Column 4 - Description */}
        <div>
          <p className="text-gray-700 leading-relaxed">
            {t.footerDescription}
          </p>
        </div>
      </div>

      {/* Vendor Logos */}
      <div className='py-[20px]'>
          <h3 className="text-gray-800 font-[600] mb-3">{t.provider}</h3>
                <div className="flex flex-wrap items-center gap-6 mb-6">
        <img 
          src="https://images.6949393020.com//TCG_PROD_IMAGES/RNG_LIST_VENDOR/PG-COLOR.png" 
          alt="PG" 
          className="h-6 opacity-70 hover:opacity-100 transition-opacity" 
        />
        <img 
          src="https://images.6949393020.com//TCG_PROD_IMAGES/RNG_LIST_VENDOR/EG2-COLOR.png" 
          alt="EG" 
          className="h-6 opacity-70 hover:opacity-100 transition-opacity" 
        />
        <img 
          src="https://images.6949393020.com//TCG_PROD_IMAGES/RNG_LIST_VENDOR/JDB-COLOR.png" 
          alt="JDB" 
          className="h-6 opacity-70 hover:opacity-100 transition-opacity" 
        />
        <img 
          src="https://images.6949393020.com//TCG_PROD_IMAGES/RNG_LIST_VENDOR/CQ9-COLOR.png" 
          alt="CQ9" 
          className="h-6 opacity-70 hover:opacity-100 transition-opacity" 
        />
        <img 
          src="https://images.6949393020.com//TCG_PROD_IMAGES/RNG_LIST_VENDOR/FC-COLOR.png" 
          alt="FC" 
          className="h-6 opacity-70 hover:opacity-100 transition-opacity" 
        />
        <img 
          src="https://images.6949393020.com//TCG_PROD_IMAGES/RNG_LIST_VENDOR/JL-COLOR.png" 
          alt="JL" 
          className="h-6 opacity-70 hover:opacity-100 transition-opacity" 
        />
        <img 
          src="https://images.6949393020.com//TCG_PROD_IMAGES/RNG_LIST_VENDOR/BGS-COLOR.png" 
          alt="BGS" 
          className="h-6 opacity-70 hover:opacity-100 transition-opacity" 
        />
        <img 
          src="https://images.5943920202.com//TCG_PROD_IMAGES/RNG_LIST_VENDOR/SPB-COLOR.png" 
          alt="SPB" 
          className="h-6 opacity-70 hover:opacity-100 transition-opacity" 
        />
        <img 
          src="https://images.5943920202.com//TCG_PROD_IMAGES/RNG_LIST_VENDOR/PP-COLOR.png" 
          alt="PP" 
          className="h-6 opacity-70 hover:opacity-100 transition-opacity" 
        />
        <img 
          src="https://images.5943920202.com//TCG_PROD_IMAGES/RNG_LIST_VENDOR/BNG-COLOR.png" 
          alt="BNG" 
          className="h-6 opacity-70 hover:opacity-100 transition-opacity" 
        />
        <img 
          src="https://images.5943920202.com//TCG_PROD_IMAGES/RNG_LIST_VENDOR/BTG-COLOR.png" 
          alt="BTG" 
          className="h-6 opacity-70 hover:opacity-100 transition-opacity" 
        />
        <img 
          src="https://images.5943920202.com//TCG_PROD_IMAGES/RNG_LIST_VENDOR/NE-COLOR.png" 
          alt="NE" 
          className="h-6 opacity-70 hover:opacity-100 transition-opacity" 
        />
        <img 
          src="https://images.5943920202.com//TCG_PROD_IMAGES/RNG_LIST_VENDOR/RT-COLOR.png" 
          alt="RT" 
          className="h-6 opacity-70 hover:opacity-100 transition-opacity" 
        />
      </div>
      </div>


      {/* Payment Methods */}
    <div className='w-full flex justify-between items-center'>
        <div className="flex flex-col md:justify-center mb-6">
        <h3 className="text-gray-800 font-[600] mb-3">{t.paymentMethods}</h3>
        <div className="flex flex-wrap md:justify-center items-center gap-4">
          <img 
            src="https://xxxbetgames.com/icons-xxx/payments/138.svg" 
            alt="Bkash" 
            className="h-8 opacity-80 hover:opacity-100 transition-opacity" 
          />
          <img 
            src="https://xxxbetgames.com/icons-xxx/payments/134.svg" 
            alt="Nagad" 
            className="h-8 opacity-80 hover:opacity-100 transition-opacity" 
          />
                    <img 
            src="https://www.dutchbanglabank.com/img/mlogo.png" 
            alt="Rocket" 
            className="w-[80px] opacity-80 hover:opacity-100 transition-opacity" 
          />
        </div>
      </div>
      <div className='flex justify-cente items-center gap-3'>
        <img className='w-8' src="https://elon.casino/casino/icons-elon/footer/age.svg" alt="" />
      </div>
    </div>
      {/* Copyright */}
      <div className="text-center text-gray-500 text-xs border-t border-gray-200 pt-6 pb-[50px] md:pb-0">
        <p>{t.copyright}</p>
        <div className="flex justify-center gap-4 mt-2">
          <a 
            href={terms_file}
            download 
            className="hover:text-cyan-400 cursor-pointer transition-colors"
          >
            {t.terms}
          </a>
          <a 
            href={terms_file}
            download 
            className="hover:text-cyan-400 cursor-pointer transition-colors"
          >
            {t.privacyPolicy}
          </a>
          <a 
            href={terms_file}
            download 
            className="hover:text-cyan-400 cursor-pointer transition-colors"
          >
            {t.responsibleGaming}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;