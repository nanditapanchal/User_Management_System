import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API, { setAuthToken } from "../api";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    if (error) {
      setErrorMsg(error);
      navigate("/login", { replace: true }); 
      setTimeout(() => setErrorMsg(""), 5000); 
    }
  }, [location, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      setAuthToken(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Something went wrong");
      setTimeout(() => setErrorMsg(""), 5000);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  const goToRegister = () => navigate("/register");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-4 relative">
      {/* Toast popup */}
      {errorMsg && (
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg animate-slide-in">
          {errorMsg}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-transform hover:scale-105"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
          Login
        </h2>

        <form onSubmit={handleLogin} className="mb-6 space-y-4">
          <input
            name="email"
            placeholder="Email"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition shadow-sm"
            required
            onChange={handleChange}
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition pr-10 shadow-sm"
              required
              onChange={handleChange}
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <AiFillEyeInvisible size={22} />
              ) : (
                <AiFillEye size={22} />
              )}
            </span>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition font-semibold shadow-lg"
          >
            Sign In
          </button>
        </form>

        <div className="flex justify-center mb-4 text-gray-600 text-sm">
          Don't have an account? {"  "}
          <span
            className="cursor-pointer text-purple-500 hover:underline transition"
            onClick={goToRegister}
          >
             Register
          </span>
        </div>

        <div className="text-center mb-4 text-gray-500 font-semibold">OR</div>

       <button
  onClick={handleGoogleSignIn}
  className="w-full bg-white text-gray-700 p-3 rounded-xl hover:bg-gray-100 transition flex items-center justify-center shadow-md font-semibold border border-gray-300"
>
         <svg
  className="w-5 h-5 mr-2"
  viewBox="0 0 533.5 544.3"
>
  <path fill="#4285F4" d="M533.5 278.4c0-17.7-1.5-34.6-4.3-51H272v96.6h146.9c-6.4 34.6-25.7 63.8-54.7 83.4v69.2h88.3c51.6-47.6 81.2-117.5 81.2-198.2z"/>
  <path fill="#34A853" d="M272 544.3c73.6 0 135.4-24.3 180.6-66.1l-88.3-69.2c-24.5 16.4-56 26-92.3 26-70.9 0-131-47.9-152.5-112.3H29.9v70.6c45.1 89.1 137.2 150.9 242.1 150.9z"/>
  <path fill="#FBBC05" d="M119.5 321.3c-10.3-30.6-10.3-63.9 0-94.5V156.2H29.9c-45.1 89.1-45.1 195.1 0 284.2l89.6-70.6z"/>
  <path fill="#EA4335" d="M272 107.6c38.7-.6 75.9 14 104.1 40.7l78.1-78.1C407.4 25.7 345.6 0 272 0 167.2 0 75.1 61.8 29.9 150.9l89.6 70.6c21.5-64.4 81.6-112.3 152.5-112.3z"/>
</svg>


          Sign up with Google
        </button>
      </motion.div>
    </div>
  );
}
