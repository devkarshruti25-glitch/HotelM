import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category)
      );
    }
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case "low-high":
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;
      case "high-low":
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  const clearFilters = () => {
    setCategory([]);
    setSubCategory([]);
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  return (
    <div className="bg-[#FAF7F5] p-4 sm:p-8 min-h-screen">
      <div className="flex flex-col gap-1 pt-10 border-t border-gray-300 sm:flex-row sm:gap-10">
        {/* Filter Options */}
        <div className="min-w-60 text-[#2C3E50]">
          <p
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 my-2 text-xl font-semibold cursor-pointer"
          >
            FILTERS
            <img
              className={`h-3 sm:hidden transition-transform duration-300 ${showFilter ? "rotate-90" : ""}`}
              src={assets.dropdown_icon}
              alt="Dropdown"
            />
          </p>
          {/* Category Filters */}
          <div
            className={`border border-gray-300 pl-5 py-4 mt-6 rounded-lg bg-white shadow-sm ${
              showFilter ? "" : "hidden"
            } sm:block`}
          >
            <p className="mb-3 text-base font-semibold text-[#A37D40]">DIET</p>
            <div className="flex flex-col gap-3 text-sm font-light text-gray-700">
              <label className="flex items-center gap-3 cursor-pointer hover:text-[#5A7D37]">
                <input
                  className="w-4 h-4 border-[#A37D40] text-[#A37D40] focus:ring-[#A37D40] rounded"
                  type="checkbox"
                  value={"Veg"}
                  onChange={toggleCategory}
                  checked={category.includes("Veg")}
                />
                Vegetarian
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:text-[#5A7D37]">
                <input
                  className="w-4 h-4 border-[#A37D40] text-[#A37D40] focus:ring-[#A37D40] rounded"
                  type="checkbox"
                  value={"Non Veg"}
                  onChange={toggleCategory}
                  checked={category.includes("Non Veg")}
                />
                Non-Vegetarian
              </label>
            </div>
          </div>
          {/* Sub Category Filters */}
          <div
            className={`border border-gray-300 pl-5 py-4 mt-5 rounded-lg bg-white shadow-sm ${
              showFilter ? "" : "hidden"
            } sm:block`}
          >
            <p className="mb-3 text-base font-semibold text-[#A37D40]">COURSE TYPE</p>
            <div className="flex flex-col gap-3 text-sm font-light text-gray-700">
              <label className="flex items-center gap-3 cursor-pointer hover:text-[#5A7D37]">
                <input
                  className="w-4 h-4 border-[#A37D40] text-[#A37D40] focus:ring-[#A37D40] rounded"
                  type="checkbox"
                  value={"Starter"}
                  onChange={toggleSubCategory}
                  checked={subCategory.includes("Starter")}
                />
                Starter
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:text-[#5A7D37]">
                <input
                  className="w-4 h-4 border-[#A37D40] text-[#A37D40] focus:ring-[#A37D40] rounded"
                  type="checkbox"
                  value={"Main Course"}
                  onChange={toggleSubCategory}
                  checked={subCategory.includes("Main Course")}
                />
                Main Course
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:text-[#5A7D37]">
                <input
                  className="w-4 h-4 border-[#A37D40] text-[#A37D40] focus:ring-[#A37D40] rounded"
                  type="checkbox"
                  value={"End Course"}
                  onChange={toggleSubCategory}
                  checked={subCategory.includes("End Course")}
                />
                Desserts / Sides
              </label>
            </div>
          </div>
          {/* Clear Filters Button */}
          <button
            className={`px-4 py-2 mt-5 font-semibold text-white bg-[#5A7D37] rounded-lg transition duration-200 hover:bg-[#4a672e] shadow-md ${
              showFilter ? "block" : "hidden"
            } sm:block`}
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        {/* View Product Items */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6 text-base sm:text-2xl">
            <Title text1={"GOURMET"} text2={"MENU"} />
            {/* Product Sort */}
            <select
              onChange={(e) => setSortType(e.target.value)}
              className="px-3 py-2 text-sm border-2 border-gray-300 rounded-lg text-[#2C3E50] focus:border-[#A37D40]"
            >
              <option value="relevant">Sort by: Recommended</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>
          {/* Map Products */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 gap-y-8">
            {filterProducts.map((item, index) => (
              <ProductItem
                key={index}
                id={item._id}
                name={item.name}
                image={item.image}
                price={item.price}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
