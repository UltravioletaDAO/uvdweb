import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getInactiveUsers } from "../services/purge/Purge";
import { useTranslation } from "react-i18next";

const Purge = () => {
  const navigate = useNavigate();
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const { t } = useTranslation();

  const handleReturn = () => {
    navigate("/", { replace: true });
  };

  const headers = [
    t('purge.headers.username'),
    t('purge.headers.wallet'),
    t('purge.headers.balance'),
    t('purge.headers.status'),
    t('purge.headers.reason')
  ];

  useEffect(() => {
    getInactiveUsers().then(setInactiveUsers);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="maxs-h-screen bg-background container mx-auto py-16 px-4"
    >
      <motion.button
        onClick={handleReturn}
        className="inline-flex items-center space-x-2 text-text-secondary
					hover:text-text-primary transition-all duration-200 mb-8
					hover:translate-x-[-5px]"
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>{t('success.back_home')}</span>
      </motion.button>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-4xl font-bold text-text-primary mb-8
									text-center"
      >
        {t('purge.title')}
      </motion.h1>

      <div className="overflow-x-auto">
        <motion.table
          className="min-w-full border border-gray-200 rounded-lg shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <thead className="bg-[#121212] text-white text-left">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="p-3 border">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inactiveUsers.map((item, index) => (
              <tr
                key={index}
                className="transition hover:bg-[rgb(90_0_204_/1)] hover:shadow text-left"
              >
                <td className="p-3 border">{item.username}</td>
                <td className="p-3 border w-[200px]">{item.wallet}</td>
                <td className="p-3 border max-w-xs whitespace-pre-wrap break-words">
                  {item.current}
                </td>
                <td className="p-3 border">{item.status}</td>
                <td className="p-3 border max-w-xs whitespace-pre-wrap break-words">
                  {item.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </motion.table>
      </div>
    </motion.div>
  );
};

export default Purge;
