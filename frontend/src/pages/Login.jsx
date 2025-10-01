import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { setAuthToken } from "../api";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

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
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  const goToRegister = () => navigate("/register");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-transform hover:scale-105">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Login
        </h2>
        <form onSubmit={handleLogin} className="mb-6 space-y-4">
          <input
            name="email"
            placeholder="Email"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
            onChange={handleChange}
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition pr-10"
              required
              onChange={handleChange}
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <AiFillEyeInvisible size={22} /> : <AiFillEye size={22} />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 transition font-semibold shadow-md"
          >
            Sign In
          </button>
        </form>

        <div className="flex justify-between items-center mb-6 text-gray-600">
          <span className="text-sm cursor-pointer hover:text-blue-500 transition" onClick={goToRegister}>
            Don't have an account? Register
          </span>
        </div>

        <div className="text-center mb-4 text-gray-500 font-semibold">OR</div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition flex items-center justify-center shadow-md font-semibold"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
