import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart } from "react-icons/fa";

const ProductCard = ({ product, toggleFavorite, isFavorite }) => {
  const [showHeart, setShowHeart] = useState(false);

  const handleFavorite = () => {
    toggleFavorite(product.id);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-4">
      <img
        src={product.image}
        alt={product.name}
        className="rounded-xl w-full h-40 object-cover"
      />

      <h3 className="text-lg font-semibold mt-3">{product.name}</h3>
      <p className="text-gray-500">{product.price} астро-коинов</p>

      <button
        onClick={handleFavorite}
        className="absolute top-4 right-4 text-2xl"
      >
        <FaHeart color={isFavorite ? "red" : "gray"} />
      </button>

      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1.2, y: -20 }}
            exit={{ opacity: 0, scale: 0.8, y: -40 }}
            transition={{ duration: 0.6 }}
            className="absolute top-6 right-6 text-pink-500 text-3xl"
          >
            ❤️
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductCard;
