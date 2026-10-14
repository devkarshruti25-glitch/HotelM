import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);

  const colors = {
    text: "text-[#2C3E50]",
    accent: "text-[#A37D40]",
  };

  const defaultImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";

  return (
    <Link className={`${colors.text} cursor-pointer group`} to={`/product/${id}`}>
      <div className="overflow-hidden rounded-lg shadow-sm border border-[#2C3E50]/5 aspect-square bg-gray-100 flex items-center justify-center">
        <img
          className="w-full h-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
          src={image && image[0] ? image[0] : defaultImage}
          alt={name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultImage;
          }}
        />
      </div>
      <p className="pt-4 pb-1 text-base font-medium">{name}</p>
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
