import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    // Simple client-side validation check
    if ((currentState === 'Sign Up' && !name) || !email || !password) {
        toast.error("Please fill in all required fields.");
        return;
    }
    
    try {
      let response;
      if (currentState === 'Sign Up') {
        response = await axios.post(
          `${backendUrl}/api/user/register`,
          { name, email, password },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        response = await axios.post(
          `${backendUrl}/api/user/login`,
          {email, password }
        );
      }

      // Check the backend's explicit 'success' flag
      if (response.data.success) {
        setToken(response.data.token)
        localStorage.setItem('token',response.data.token)
        // Success toast should be moved here for better UX
        toast.success(currentState === 'Login' ? "Login successful!" : "Account created successfully!");
      }
      else {
        // Handle application-specific errors (user not found, invalid password)
        toast.error(response.data.message || "An unknown error occurred during authentication.");
      }

    } catch (error) {
      // Handle network errors (server down, connection failed)
      console.error("Authentication Error:", error);
      if (error.response && error.response.data && error.response.data.message) {
         toast.error(error.response.data.message);
      } else {
         toast.error("Network or server error. Please try again.");
      }
    }
  };
  
  // Navigates to home page automatically if token is set
  useEffect(()=>{
    if (token) {
      navigate('/')
    }
  },[token, navigate]) // Added 'navigate' to dependency array for best practice
  
  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col items-center w-[90%] sm:max-w-96 mx-auto my-14 p-8 bg-white shadow-xl rounded-xl gap-5 text-[#2C3E50]">
      <div className="inline-flex items-center gap-2 mt-2 mb-2">
        <p className="text-3xl font-serif font-bold text-[#2C3E50]">{currentState}</p>
        <hr className="border-none h-[2px] w-8 bg-[#A37D40] rounded" />
      </div>
      {currentState === "Login" ? (
        ""
      ) : (
        <input 
          onChange={(e) => setName(e.target.value)} 
          value={name}
          type="text"
          className="w-full px-4 py-3 border border-[#2C3E50] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A37D40] transition duration-200"
          placeholder="Full Name"
          required
        />
      )}
      <input 
        onChange={(e) => setEmail(e.target.value)} 
        value={email}
        type="email"
        className="w-full px-4 py-3 border border-[#2C3E50] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A37D40] transition duration-200"
        placeholder="Email Address"
        required
      />
      <input 
        onChange={(e) => setPassword(e.target.value)} 
        value={password}
        type="password"
        className="w-full px-4 py-3 border border-[#2C3E50] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A37D40] transition duration-200"
        placeholder="Password"
        required
      />
      <div className="flex justify-between w-full text-sm mt-[-8px]">
        <p className="cursor-pointer text-gray-500 hover:text-[#A37D40] transition duration-150">Forgot your password?</p>
        {currentState === "Login" ? (
          <p
            onClick={() => setCurrentState("Sign Up")}
            className="cursor-pointer text-[#A37D40] font-medium hover:underline transition duration-150"
          >
            Create a new account
          </p>
        ) : (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer text-[#A37D40] font-medium hover:underline transition duration-150"
          >
            Login here
          </p>
        )}
      </div>
      <button 
        type="submit" 
        className="px-8 py-3 mt-4 w-full font-semibold text-white bg-[#A37D40] rounded-lg hover:bg-[#856535] transition duration-200 shadow-md"
      >
        {currentState === "Login" ? "Sign In" : "Create Account"}
      </button>
    </form>
  );
};

export default Login;
