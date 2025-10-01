import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { setAuthToken } from "../api";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    fatherNumber: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // On mount: check token & fetch contacts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    setAuthToken(token);

    API.get("/api/contacts")
      .then((res) => setContacts(res.data))
      .catch((err) => console.error(err));
  }, [navigate]);

  // Add new contact
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/contacts", newContact);
      setContacts((prev) => [...prev, res.data]);
      setNewContact({ name: "", email: "", phone: "", age: "", fatherNumber: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to add contact. Make sure all required fields are filled.");
    }
  };

  // Toggle select checkbox
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Delete selected contacts
  const deleteSelected = async () => {
    try {
      await Promise.all(selectedIds.map((id) => API.delete(`/api/contacts/${id}`)));
      setContacts((prev) => prev.filter((c) => !selectedIds.includes(c._id)));
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      alert("Failed to delete selected contacts.");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    navigate("/login");
  };

  // Sorting
  const sortedContacts = React.useMemo(() => {
    if (!sortConfig.key) return contacts;
    const sorted = [...contacts].sort((a, b) => {
      const aValue = a[sortConfig.key] || "";
      const bValue = b[sortConfig.key] || "";
      if (typeof aValue === "string") return aValue.localeCompare(bValue);
      return aValue - bValue;
    });
    if (sortConfig.direction === "desc") sorted.reverse();
    return sorted;
  }, [contacts, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) return sortConfig.direction === "asc" ? "↑" : "↓";
    return "";
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold">
          Dashboard
        </motion.h1>
        <button
          onClick={handleLogout}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Add Contact Form */}
      <motion.form
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 bg-white p-4 rounded shadow"
        onSubmit={handleAdd}
      >
        <h2 className="font-semibold mb-2">Add Contact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            placeholder="Name"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            placeholder="Email"
            value={newContact.email}
            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            placeholder="Phone"
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            placeholder="Age"
            value={newContact.age}
            onChange={(e) => setNewContact({ ...newContact, age: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            placeholder="Father's Number"
            value={newContact.fatherNumber}
            onChange={(e) => setNewContact({ ...newContact, fatherNumber: e.target.value })}
            className="p-2 border rounded"
          />
        </div>
        <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
          Add
        </button>
      </motion.form>

      {/* Delete Selected */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={deleteSelected}
          disabled={selectedIds.length === 0}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Delete Selected
        </button>
        <p>{selectedIds.length} selected</p>
      </div>

      {/* Contacts Table */}
      <motion.table initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-center">Select</th>
            <th className="p-2 cursor-pointer" onClick={() => requestSort("name")}>
              Name {getSortIndicator("name")}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => requestSort("email")}>
              Email {getSortIndicator("email")}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => requestSort("phone")}>
              Phone {getSortIndicator("phone")}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => requestSort("age")}>
              Age {getSortIndicator("age")}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => requestSort("fatherNumber")}>
              Father’s Number {getSortIndicator("fatherNumber")}
            </th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedContacts.map((c) => (
            <tr key={c._id} className="hover:bg-gray-100 transition">
              <td className="text-center p-2">
                <input type="checkbox" checked={selectedIds.includes(c._id)} onChange={() => toggleSelect(c._id)} />
              </td>
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.email}</td>
              <td className="p-2">{c.phone}</td>
              <td className="p-2">{c.age}</td>
              <td className="p-2">{c.fatherNumber}</td>
              <td className="p-2">
                <button
                  onClick={async () => {
                    await API.delete(`/api/contacts/${c._id}`);
                    setContacts((prev) => prev.filter((item) => item._id !== c._id));
                  }}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </motion.table>
    </div>
  );
}
