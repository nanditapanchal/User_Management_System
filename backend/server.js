import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import contactRoutes from "./routes/contacts.js";
import "./config/passport.js";

const app = express();
const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: FRONTEND, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sess_secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/api/contacts", contactRoutes);

app.get("/", (req, res) => res.json({ ok: true }));

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/assignmentdb")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log("Server running on", process.env.PORT || 5000)
    );
  })
  .catch((err) => console.error("DB connect error:", err));
