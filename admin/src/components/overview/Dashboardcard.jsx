import { useEffect, useState } from "react";
import axios from "axios";
import { FaMoneyBillWave, FaBan } from "react-icons/fa6";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsPercent } from "react-icons/bs";

const Card = ({ title, data }) => {
  return (
    <div className="w-full bg-white px-[20px] py-[15px] shadow-md rounded-[5px] border-[1px] border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-white p-4 shadow-sm border border-gray-200"
          >
            <div className={`p-3 rounded-lg ${item.bgColor}`}>{item.icon}</div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">{item.value}</p>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Dashboardcard() {
 const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const [overviewData, setOverviewData] = useState({
    totalDeposit: 0,
    todaysDeposit: 0,
    totalWithdraw: 0,
    todaysWithdraw: 0,
    totalRejectedWithdraw:0,
    totalRejectedDeposit:0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${base_url}/admin/admin-overview`,{
            headers: {
                 'Authorization': localStorage.getItem('token')
                },
          });
        setOverviewData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const deposits = [
    {
      value: `৳${overviewData.totalDeposit.toFixed(2)} BDT`,
      label: "Total Deposited",
      icon: <FaMoneyBillWave className="text-green-600 text-2xl" />,
      bgColor: "bg-green-100",
    },
    {
      value: `৳${overviewData.todaysDeposit}`,
      label: "Today Deposits",
      icon: <AiOutlineLoading3Quarters className="text-orange-500 text-2xl animate-spin" />,
      bgColor: "bg-orange-100",
    },
    {
      value: `৳${overviewData.totalRejectedDeposit}`, // Placeholder for rejected deposits
      label: "Rejected Deposits",
      icon: <FaBan className="text-red-500 text-2xl" />,
      bgColor: "bg-red-100",
    },
    {
      value: "৳0.00 BDT", // Placeholder for deposit charge
      label: "Deposited Charge",
      icon: <BsPercent className="text-purple-500 text-2xl" />,
      bgColor: "bg-purple-100",
    },
  ];

  const withdrawals = [
    {
      value: `৳${overviewData.totalWithdraw.toFixed(2)} BDT`,
      label: "Total Withdrawn",
      icon: <FaMoneyBillWave className="text-green-600 text-2xl" />,
      bgColor: "bg-green-100",
    },
    {
      value: `৳${overviewData.todaysWithdraw}`,
      label: "Today Withdrawals",
      icon: <AiOutlineLoading3Quarters className="text-orange-500 text-2xl animate-spin" />,
      bgColor: "bg-orange-100",
    },
    {
      value: `৳${overviewData.totalRejectedWithdraw}`, // Placeholder for rejected withdrawals
      label: "Rejected Withdrawals",
      icon: <FaBan className="text-red-500 text-2xl" />,
      bgColor: "bg-red-100",
    },
    {
      value:`৳${overviewData?.totalWithdrawTax}`, // Placeholder for withdrawal charge
      label: "Withdrawal Charge",
      icon: <BsPercent className="text-purple-500 text-2xl" />,
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="w-full grid grid-cols-2 gap-[25px] mb-[30px]">
      <Card title="Deposits" data={deposits} />
      <Card title="Withdrawals" data={withdrawals} />
    </div>
  );
}
