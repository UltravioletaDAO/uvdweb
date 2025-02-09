import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const DarkModeToggle = ({ isDark, onToggle }) => (
  <motion.button
    onClick={onToggle}
    className="fixed top-4 right-4 p-2 rounded-full bg-white/10 backdrop-blur-sm
      hover:bg-white/20 transition-colors duration-200 z-50"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    {isDark ? (
      <SunIcon className="w-6 h-6 text-yellow-400" />
    ) : (
      <MoonIcon className="w-6 h-6 text-gray-600" />
    )}
  </motion.button>
);

export default DarkModeToggle; 