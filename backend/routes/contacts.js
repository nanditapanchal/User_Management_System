import express from "express";
import Contact from "../models/Contact.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Get all contacts
router.get("/", authMiddleware, async (req, res) => {
  const contacts = await Contact.find();
  res.json(contacts);
});

// Add contact
router.post("/", authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json(contact);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete contact
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
