import React from "react";
import { motion } from "framer-motion";

const AstroBuddy = ({ childName }) => {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="fixed bottom-4 left-4 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-2xl p-3 shadow-xl flex items-center space-x-3"
    >
      <motion.img
        src="/astrobuddy.png" // сюда вставим изображение персонажа
        alt="AstroBuddy"
        className="w-12 h-12 rounded-full border-2 border-white"
        animate={{
          y: [0, -5, 0],
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      <div>
        <p className="font-semibold text-sm">Привет, {childName || "друг"} 👋</p>
        <p className="text-xs opacity-90">Выбирай товары, добавляй в избранное и копи астро-коины!</p>
      </div>
    </motion.div>
  );
};

export default AstroBuddy;
