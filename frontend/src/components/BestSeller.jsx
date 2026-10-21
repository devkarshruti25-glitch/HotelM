import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    // Filter products marked as bestseller and limit to 5
    const bestProduct = products.filter((item) => item.bestSeller || item.bestseller);
    setBestSeller(bestProduct.slice(0, 5));
  }, [products]);

  return (
    <div className="my-10 p-4 sm:p-8 bg-[#FAF7F5] text-[#2C3E50]"> {/* Premium Base Color */}
      <div className="py-8 text-3xl text-center">
        <Title text1={"TOP"} text2={"RATED"} />
        <p className="w-3/4 m-auto text-xs text-[#2C3E50]/80 sm:text-sm md:text-base font-light mt-2">
          Our top rated are a curated selection of gourmet dishes that have
          won over our patrons with their authentic flavors, premium ingredients, and exceptional value.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-6">
        {bestSeller.map((item, index) => (
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

export default BestSeller;
