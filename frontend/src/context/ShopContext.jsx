import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [token,setToken]= useState('');
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currency = "₹";
  const delivery_fee = 10;
  const [products,setProducts]=useState([]);
  
  // Fetch all products on initial load
  const getProductsData = async ()=>{
    try {
      const response = await axios.get(backendUrl+ '/api/product/list');
      if (response.data.success) {
        setProducts(response.data.products);
      }
      else{
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Get user cart from DB if logged in
  const getUserCart = async (token) =>{
    try {
      const response = await axios.post(backendUrl+'/api/cart/get',{},{headers:{token}})
      if (response.data.success) {
        setCartItems(response.data.cartData)
      }
    } catch (error) {
      console.log(error)
      // Don't toast error here, it's confusing on load
    }
  }

  // --- Consolidated Initial Load Effect ---
  useEffect (()=>{
    async function loadData() {
      // 1. Always fetch products
      await getProductsData();

      // 2. Check for token
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        // 3. If token exists, load cart from DB
        await getUserCart(storedToken);
      } else {
        // 4. If no token, load guest cart from localStorage
        const cartItemsString = localStorage.getItem("cartItems");
        const storedCartItems = (cartItemsString && cartItemsString !== "undefined")
            ? JSON.parse(cartItemsString)
            : null;

        if (storedCartItems) {
            setCartItems(storedCartItems);
        }
      }
    }
    
    loadData();
  },[]) // Runs only ONCE on mount

  // Save cart to localStorage when it changes (for guest users)
  useEffect(() => {
    // Only save to localStorage if there is NO token
    if (!token) {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, token]);

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Please Select a Size");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    setCartItems(cartData);
    // Show success toast AFTER state is updated
    toast.success("Item Added To The Cart");

    if (token) {
      try {
        await axios.post(backendUrl+'/api/cart/add',{itemId,size},{headers:{token}})
      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          // INFO: Error Handling
        }
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);

    if (quantity === 0) {
      // If quantity is 0, remove the item
      if (cartData[itemId] && cartData[itemId][size]) {
        delete cartData[itemId][size];
        // Clean up: if no more sizes for this item, remove the item ID
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }
      toast.success("Item Removed From The Cart");
    } else {
      // Otherwise, update the quantity
      cartData[itemId][size] = quantity;
    }

    setCartItems(cartData);

    if (token) {
      try {
        // Send update to backend (backend should also handle 0 quantity for removal)
        await axios.post(backendUrl+'/api/cart/update',{itemId,size,quantity},{headers:{token}})
      } catch (error) {
         console.log(error)
        toast.error(error.message)
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      // CRITICAL FIX: Ensure product list is loaded and itemInfo is found
      let itemInfo = products.find((product) => product._id === items);
      
      if (itemInfo) { // Only proceed if itemInfo exists
        for (const item in cartItems[items]) {
          try {
            if (cartItems[items][item] > 0) {
              totalAmount += itemInfo.price * cartItems[items][item];
            }
          } catch (error) {
            // Catch any unexpected errors
            console.error("Error calculating cart amount:", error);
          }
        }
      }
    }
    return totalAmount;
  };

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    setCartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    token,
    setToken
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
