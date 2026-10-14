import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [listProducts, setListProducts] = useState([]);

  const fetchListProducts = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");

      if (response.data.success) {
        setListProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      // FIX: Handle network errors or errors without a response message
      toast.error(error.response?.data?.message || "Failed to fetch products.");
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.info(response.data.message);
        await fetchListProducts(); // Refresh list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      // FIX: Handle network errors or errors without a response message
      toast.error(error.response?.data?.message || "Failed to remove product.");
    }
  };

  useEffect(() => {
    fetchListProducts();
  }, []);

  return (
    <div className="p-8 w-full text-[#2C3E50]">
      <h2 className="text-2xl font-semibold mb-6">All Food Items List</h2>
      <div className="flex flex-col gap-0">
        
        {/* List Table Header */}
        <div className="hidden md:grid grid-cols-[0.5fr_2fr_3fr_1fr_1fr_1fr_0.5fr] items-center gap-4 py-3 px-3 border-b-2 border-gray-200 text-xs font-semibold uppercase text-gray-500">
          <b className="text-center">Image</b>
          <b className="text-left">Name</b>
          <b className="text-left">Description</b>
          <b className="text-center">Category</b>
          <b className="text-center">Sub Category</b>
          <b className="text-center">Price</b>
          <b className="text-center">Action</b>
        </div>

        {/* Display Products */}
        {listProducts.length === 0 && (
          <p className="py-10 text-center text-gray-500">No products found.</p>
        )}

        {listProducts.map((item) => (
          <div
            // FIX: Use item._id for a stable key
            key={item._id}
            className="grid grid-cols-[0.5fr_2fr_3fr_1fr_1fr_1fr_0.5fr] md:grid-cols-[0.5fr_2fr_3fr_1fr_1fr_1fr_0.5fr] items-center gap-4 py-3 px-3 border-b border-gray-200 text-sm text-center"
          >
            {/* Image */}
            <img
              className="w-12 h-12 object-cover rounded-md mx-auto"
              src={item.image && item.image[0] ? item.image[0] : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
  }}
              alt={item.name}
            />
            {/* Name */}
            <p className="text-left font-medium">{item.name}</p>
            {/* Description */}
            <p className="text-left text-xs text-gray-600 line-clamp-2">
              {item.description}
            </p>
            {/* Category */}
            <p className="text-xs bg-gray-100 px-2 py-1 rounded-full w-fit mx-auto">{item.category}</p>
            {/* Sub Category */}
            <p className="text-xs bg-gray-100 px-2 py-1 rounded-full w-fit mx-auto">{item.subCategory}</p>
            {/* Price */}
            <p className="font-semibold">{currency(item.price)}</p>
            {/* Remove Button */}
            <div
              onClick={() => removeProduct(item._id)}
              className="mx-auto w-8 h-8 flex items-center justify-center text-red-600 bg-red-100 rounded-full cursor-pointer hover:bg-red-200 hover:text-red-800 transition-colors duration-200"
              title="Remove Item"
            >
              <b className="text-xl leading-none select-none">×</b>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;

