import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  // State for images
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  // State for form data
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState([]);
  const [bestSeller, setBestSeller] = useState(false);

  // --- Premium Tailwind Styles ---
  const premiumStyles = {
    text: "text-[#2C3E50]",
    heading: "text-lg font-semibold text-[#2C3E50]",
    input:
      "w-full px-4 py-2.5 border border-[#2C3E50]/30 rounded-lg outline-none transition duration-150 focus:border-[#A37D40] focus:ring-1 focus:ring-[#A37D40] max-w-[500px]",
    btnPrimary:
      "px-6 py-3 mt-2 text-white font-semibold rounded-lg bg-[#A37D40] hover:bg-[#906D38] transition-colors duration-200",
    btnSecondary:
      "px-6 py-3 mt-2 text-white font-semibold rounded-lg bg-[#2C3E50] hover:bg-[#4a6581] transition-colors duration-200",
    sizeBase:
      "px-4 py-2 cursor-pointer text-sm font-medium rounded-md transition-colors duration-150",
    sizeActive: "bg-[#A37D40] text-white",
    sizeInactive: "bg-gray-200 text-[#2C3E50] hover:bg-gray-300",
    uploadBox:
      "w-20 h-20 object-cover border-2 border-dashed border-[#A37D40]/50 rounded-lg cursor-pointer hover:border-[#A37D40] transition-colors",
    checkbox: "w-4 h-4 accent-[#A37D40] cursor-pointer",
  };
  // ---

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("price", price);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("bestSeller", bestSeller);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const resetForm = () => {
    setImage1(null);
    setImage2(null);
    setImage3(null);
    setImage4(null);
    setName("");
    setDescription("");
    setCategory("");
    setSubCategory("");
    setPrice("");
    setSizes([]);
    setBestSeller(false);
  };

  // Helper to render image upload boxes
  const renderImageUpload = (image, setImage, id) => (
    <label htmlFor={id}>
      <img
        className={premiumStyles.uploadBox}
        src={!image ? assets.upload_area : URL.createObjectURL(image)}
        alt="Upload"
      />
      <input
        onChange={(e) => setImage(e.target.files[0])}
        type="file"
        id={id}
        hidden
        accept="image/*"
      />
    </label>
  );

  return (
    <form
      onSubmit={onSubmitHandler}
      className={`flex flex-col items-start w-full gap-5 p-8 ${premiumStyles.text}`}
    >
      <div>
        <p className={premiumStyles.heading}>Upload Product Image(s)</p>
        <p className="text-xs text-gray-500 mb-2">First image is the main image.</p>
        <div className="flex gap-3">
          {renderImageUpload(image1, setImage1, "image1")}
          {renderImageUpload(image2, setImage2, "image2")}
          {renderImageUpload(image3, setImage3, "image3")}
          {renderImageUpload(image4, setImage4, "image4")}
        </div>
      </div>

      <div className="w-full mt-2">
        <p className={`mb-2 ${premiumStyles.heading}`}>Product Item Name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className={premiumStyles.input}
          type="text"
          placeholder="Enter Product Name"
          required
        />
      </div>

      <div className="w-full mt-2">
        <p className={`mb-2 ${premiumStyles.heading}`}>Product Item Description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className={`${premiumStyles.input} min-h-[100px]`}
          placeholder="Enter Product Description"
          required
        />
      </div>

      <div className="flex flex-col w-full gap-5 sm:flex-row sm:gap-8">
        <div className="flex-1">
          <p className={`mb-2 ${premiumStyles.heading}`}>Product Category</p>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className={premiumStyles.input}
            required
          >
            <option value="">Select Category</option>
            <option value="Veg">Veg</option>
            <option value="Non Veg">Non Veg</option>
          </select>
        </div>
        <div className="flex-1">
          <p className={`mb-2 ${premiumStyles.heading}`}>Product Sub Category</p>
          <select
            onChange={(e) => setSubCategory(e.target.value)}
            value={subCategory}
            className={premiumStyles.input}
            required
          >
            <option value="">Select Sub Category</option>
            <option value="Starter">Starter</option>
            <option value="Main Course">Main Course</option>
            <option value="End Course">Desserts / Sides</option>
          </select>
        </div>
        <div className="flex-1">
          <p className={`mb-2 ${premiumStyles.heading}`}>Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className={premiumStyles.input}
            type="number"
            min="0"
            placeholder="Enter Product Price"
            required
          />
        </div>
      </div>

      <div>
        <p className={`mb-2 ${premiumStyles.heading}`}>Product Sizes</p>
        <div className="flex gap-3">
          {/* CONTENT FIX: Changed S/M/L to food-appropriate sizes */}
          {["Common","Half", "Full", "Family"].map((size) => (
            <div
              key={size}
              onClick={() =>
                setSizes((prev) =>
                  prev.includes(size)
                    ? prev.filter((item) => item !== size)
                    : [...prev, size]
                )
              }
            >
              <p
                className={`${premiumStyles.sizeBase} ${
                  sizes.includes(size)
                    ? premiumStyles.sizeActive
                    : premiumStyles.sizeInactive
                }`}
              >
                {size}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <input
          type="checkbox"
          id="bestSeller"
          className={premiumStyles.checkbox}
          checked={bestSeller}
          onChange={() => setBestSeller((prev) => !prev)}
        />
        <label htmlFor="bestSeller" className="ml-2 cursor-pointer">
          Add to Best Seller
        </label>
      </div>

      <div className="flex flex-col w-full gap-2 sm:flex-row sm:gap-8">
        <button type="submit" className={premiumStyles.btnPrimary}>
          Add Product
        </button>
        <button
          type="button"
          className={premiumStyles.btnSecondary}
          onClick={resetForm}
        >
          Reset Details
        </button>
      </div>
    </form>
  );
};

export default Add;
