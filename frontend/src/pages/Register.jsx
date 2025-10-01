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
      navigate('/dashboard');
    } catch (err) {
      alert(err?.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500 p-4">
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Name" className="w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-green-400" required />
          <input name="email" type="email" placeholder="Email" className="w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-green-400" required />
          <input name="password" type="password" placeholder="Password" minLength={6} className="w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-green-400" required />
          <button type="submit" className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 transition">Register</button>
        </form>
        <p className="mt-4 text-center">
          Already have an account? <a href="/login" className="text-green-500 font-semibold hover:underline">Login</a>
        </p>
      </motion.div>
    </div>
  );
}
