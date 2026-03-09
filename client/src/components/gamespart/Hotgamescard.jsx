import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight, FaBell, FaGift } from 'react-icons/fa';
import { FaLock } from "react-icons/fa";
import Mainpagegame from '../games/Mainpagegame';
import CategorySlider from '../category/CategorySlider';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { FaWallet, FaMoneyBill } from 'react-icons/fa';
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import Allhotgames from './Allhotgames';
const Hotgamescard = () => {
  const [current, setCurrent] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;



  return (
    <section className="w-full flex justify-center items-center sm:px-4 px-2">
      <section className='w-full md:w-[95%]'>
        <Allhotgames/>
      </section>
    </section>
  );
};

export default Hotgamescard;