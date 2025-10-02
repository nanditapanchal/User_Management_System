import React from 'react';
import { useNavigate } from 'react-router-dom';
import API, { setAuthToken } from '../api';
import { motion } from 'framer-motion';

export default function Register() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const { data } = await API.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      setAuthToken(data.token);
      navigate('/login');
    } catch (err) {
      alert(err?.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-transform hover:scale-105"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500">
          Register
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Name"
            className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            minLength={6}
            className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl hover:from-green-600 hover:to-blue-600 transition font-semibold shadow-lg"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <span
            className="text-green-500 font-semibold hover:underline cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
}
