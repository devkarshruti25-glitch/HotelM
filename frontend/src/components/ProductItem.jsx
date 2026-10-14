import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);

  // Premium Color Palette
  const colors = {
      text: 'text-[#2C3E50]', // Deep Charcoal
      accent: 'text-[#A37D40]', // Rich Bronze
  };

  return (
    // Use the Deep Charcoal text color for the whole item
    <Link className={`${colors.text} cursor-pointer group`} to={`/product/${id}`}>
      {/* Add rounded corners and overflow-hidden for a clean card look */}
      <div className="overflow-hidden rounded-lg shadow-sm border border-[#2C3E50]/5">
        <img
          // Keep the hover effect, but ensure duration is set
          className="w-full transition duration-300 ease-in-out group-hover:scale-105"
          src={image[0]}
          alt={name} // Use the product name for better accessibility
        />
      </div>
      {/* Add slightly more padding and use the premium text color */}
      <p className="pt-4 pb-1 text-base font-medium">{name}</p>
      {/* Use the Rich Bronze accent color for the price */}
      <p className={`text-base font-semibold ${colors.accent}`}>
        {currency}&nbsp;
        {price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </Link>
  );
};

export default ProductItem;
