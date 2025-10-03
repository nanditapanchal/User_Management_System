import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { setAuthToken } from "../api";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDirection, setPageDirection] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    setAuthToken(token);

    API.get("/api/contacts")
      .then((res) => setContacts(res.data))
      .catch((err) => console.error(err));
  }, [navigate]);

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
    if (sortConfig.key === key) return sortConfig.direction === "asc" ? "▲" : "▼";
    return "⇵";
  };

  const gradientArrow = (key) => (
    <span className="ml-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 font-bold">
      {getSortIndicator(key)}
    </span>
  );

  // Pagination logic
  const totalPages = Math.ceil(sortedContacts.length / itemsPerPage);
  const paginatedContacts = sortedContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setPageDirection(page > currentPage ? 1 : -1);
    setCurrentPage(page);
  };

  // Generate page buttons (max 5 visible)
  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    if (start > 1) pages.push(1, "start-ellipsis");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("end-ellipsis", totalPages);

    return pages;
  };

  // Add/Edit Contact
  const handleAddOrEdit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await API.put(`/api/contacts/${editingId}`, newContact);
        setContacts((prev) =>
          prev.map((c) => (c._id === editingId ? res.data : c))
        );
        setEditingId(null);
      } else {
        const res = await API.post("/api/contacts", newContact);
        setContacts((prev) => [...prev, res.data]);
      }
      setNewContact({ name: "", email: "", phone: "", age: "", fatherNumber: "" });
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save contact. Make sure all required fields are filled.");
    }
  };

  const openEditModal = (contact) => {
    setEditingId(contact._id);
    setNewContact({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      age: contact.age,
      fatherNumber: contact.fatherNumber,
    });
    setShowModal(true);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    navigate("/login");
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-tr from-indigo-100 via-purple-100 to-pink-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500"
        >
          Dashboard
        </motion.h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded-full shadow-lg hover:scale-105 transform transition"
          >
            Add Contact
          </button>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-400 to-red-600 text-white px-5 py-2 rounded-full shadow-lg hover:scale-105 transform transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Selected Delete */}
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={deleteSelected}
          disabled={selectedIds.length === 0}
          className="bg-gradient-to-r from-red-400 to-red-600 text-white px-5 py-2 rounded-full shadow-lg hover:scale-105 transition disabled:opacity-50"
        >
          Delete Selected
        </button>
        <p className="text-gray-700 font-medium">{selectedIds.length} selected</p>
      </div>

      {/* Table */}
      <motion.div className="overflow-x-auto rounded-2xl shadow-xl bg-white">
        <motion.table className="w-full border-collapse table-auto text-left">
          <thead className="bg-gradient-to-r from-purple-300 to-pink-300 text-gray-800">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center">Select</th>
              <th className="p-3 border-b border-gray-300 cursor-pointer" onClick={() => requestSort("name")}>
                Name {gradientArrow("name")}
              </th>
              <th className="p-3 border-b border-gray-300 cursor-pointer" onClick={() => requestSort("email")}>
                Email {gradientArrow("email")}
              </th>
              <th className="p-3 border-b border-gray-300 cursor-pointer" onClick={() => requestSort("phone")}>
                Phone {gradientArrow("phone")}
              </th>
              <th className="p-3 border-b border-gray-300 cursor-pointer" onClick={() => requestSort("age")}>
                Age {gradientArrow("age")}
              </th>
              <th className="p-3 border-b border-gray-300 cursor-pointer" onClick={() => requestSort("fatherNumber")}>
                Father’s Number {gradientArrow("fatherNumber")}
              </th>
              <th className="p-3 border-b border-gray-300">Action</th>
            </tr>
          </thead>
          <AnimatePresence mode="wait">
            <motion.tbody
              key={currentPage}
              initial={{ x: pageDirection * 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -pageDirection * 300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {paginatedContacts.map((c) => (
                <motion.tr
                  key={c._id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className={`hover:bg-purple-50 transition border-b border-gray-200 ${
                    editingId === c._id ? "bg-yellow-50" : ""
                  }`}
                >
                  <td className="text-center p-2 border-r border-gray-200">
                    <input type="checkbox" checked={selectedIds.includes(c._id)} onChange={() => toggleSelect(c._id)} />
                  </td>
                  <td className="p-2 border-r border-gray-200">{c.name}</td>
                  <td className="p-2 border-r border-gray-200">{c.email}</td>
                  <td className="p-2 border-r border-gray-200">{c.phone}</td>
                  <td className="p-2 border-r border-gray-200">{c.age}</td>
                  <td className="p-2 border-r border-gray-200">{c.fatherNumber}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => openEditModal(c)}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full hover:scale-105 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        await API.delete(`/api/contacts/${c._id}`);
                        setContacts((prev) => prev.filter((item) => item._id !== c._id));
                      }}
                      className="bg-gradient-to-r from-red-400 to-red-600 text-white px-3 py-1 rounded-full hover:scale-105 transition"
                    >
                      Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </AnimatePresence>
        </motion.table>
      </motion.div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4 gap-2 flex-wrap">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-full bg-gray-300 hover:bg-gray-400 disabled:opacity-50 transition"
        >
          Prev
        </button>
        {getPageNumbers().map((p, i) =>
          p === "start-ellipsis" || p === "end-ellipsis" ? (
            <span key={i} className="px-2 py-2 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={i}
              onClick={() => goToPage(p)}
              className={`px-4 py-2 rounded-full ${
                currentPage === p ? "bg-purple-500 text-white" : "bg-gray-200 hover:bg-gray-300"
              } transition`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-full bg-gray-300 hover:bg-gray-400 disabled:opacity-50 transition"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-6 w-11/12 max-w-lg"
          >
            <h2 className="text-xl font-bold text-purple-600 mb-4">
              {editingId ? "Edit Contact" : "Add New Contact"}
            </h2>
            <form onSubmit={handleAddOrEdit} className="grid grid-cols-1 gap-4">
              <input
                placeholder="Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="p-3 border rounded-xl focus:ring-2 focus:ring-purple-300 transition"
              />
              <input
                placeholder="Email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                className="p-3 border rounded-xl focus:ring-2 focus:ring-purple-300 transition"
              />
              <input
                placeholder="Phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="p-3 border rounded-xl focus:ring-2 focus:ring-purple-300 transition"
              />
              <input
                placeholder="Age"
                value={newContact.age}
                onChange={(e) => setNewContact({ ...newContact, age: e.target.value })}
                className="p-3 border rounded-xl focus:ring-2 focus:ring-purple-300 transition"
              />
              <input
                placeholder="Father's Number"
                value={newContact.fatherNumber}
                onChange={(e) => setNewContact({ ...newContact, fatherNumber: e.target.value })}
                className="p-3 border rounded-xl focus:ring-2 focus:ring-purple-300 transition"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 rounded-full bg-gray-300 hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transform transition"
                >
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
