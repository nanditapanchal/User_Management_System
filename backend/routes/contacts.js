import express from "express";
import Contact from "../models/Contact.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Get all contacts for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }); // only this user's contacts
    res.json(contacts);
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add contact
router.post("/", authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.create({ ...req.body, user: req.user.id }); // associate with user
    res.status(201).json(contact);
  } catch (err) {
    console.error("Error adding contact:", err);
    res.status(400).json({ message: err.message });
  }
});
// Update contact (only if owned by user)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, user: req.user.id });
    if (!contact) return res.status(404).json({ message: "Contact not found" });

    // Update only provided fields
    Object.assign(contact, req.body);
    await contact.save();
    res.json(contact);
  } catch (err) {
    console.error("Error updating contact:", err);
    res.status(400).json({ message: err.message });
  }
});

// Delete contact (only if owned by user)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    console.log("Deleting contact:", req.params.id, "for user:", req.user.id);
    const contact = await Contact.findOne({ _id: req.params.id, user: req.user.id });
    if (!contact) {
      console.log("Contact not found or not owned by user");
      return res.status(404).json({ message: "Contact not found" });
    }
    await Contact.deleteOne({ _id: contact._id }); // ensures deletion from DB
    console.log("Contact deleted:", contact._id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Error deleting contact:", err);
    res.status(400).json({ message: err.message });
  }
});

export default router;
