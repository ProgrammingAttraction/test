import { motion } from "framer-motion";

const StatCard = ({ name, icon: Icon, value, color, extra = null }) => {
  return (
    <motion.div
      className="bg-white  border-[1px] border-gray-200 rounded-[10px]"
      whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
    >
      <div className="px-4 py-5 sm:p-6">
        <span className="flex items-center text-[17px] font-medium text-black">
          <Icon size={20} className="mr-2" style={{ color }} />
          {name}
        </span>
        <p className="mt-1 text-3xl font-semibold text-black">{value}</p>
        
        {/* Only show the extra info (percentage/trend) if provided */}
        {extra && <div className="mt-2 text-sm">{extra}</div>}
      </div>
    </motion.div>
  );
};

export default StatCard;
