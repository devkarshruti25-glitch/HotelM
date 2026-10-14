import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  // Premium Color Palette:
  // Deep Charcoal: #2C3E50 (Text)
  // Rich Bronze: #A37D40 (Accent/Highlight)
  // Creamy Off-White: #FAF7F5 (Background)

  useEffect(() => {
    // Limits the display to the first 10 products
    setLatestProducts(products.slice(0, 10)); 
  }, [products]);

  return (
    <div className="my-10">
      <div className="py-8 text-3xl text-center">
        <Title text1={"NEW"} text2={"DISHES"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-[#2C3E50]/70">
          Be the first to explore our newest culinary creations. These fresh additions are carefully crafted by our chefs to bring exciting, seasonal flavors straight to your table.
        </p>
      </div>

      {/* Rendering Product Items */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-6">
        {latestProducts.map((item, index) => (
          // Assuming ProductItem uses the shared premium color styles
          <ProductItem
            key={item._id || index}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
