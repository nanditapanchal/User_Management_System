import express from "express";
import passport from "passport";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// 🔹 Helper: Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", async (err, user, info) => {
      if (err) return next(err);

      try {
        if (!user) {
          // 🚨 If Passport didn't create user, try linking Google email to existing account
          const profileEmail = info?.profile?.emails?.[0]?.value;
          if (profileEmail) {
            const existing = await User.findOne({ email: profileEmail });
            if (existing) {
              existing.googleId = info.profile.id;
              await existing.save();

              const token = generateToken(existing);
              return res.redirect(
                `${process.env.FRONTEND_URL}/oauth-success?token=${token}`
              );
            }
          }

          const errorMsg = info?.message || "Google login failed";
          return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(
              errorMsg
            )}`
          );
        }

        // ✅ Authenticated successfully
        const token = generateToken(user);
        return res.redirect(
          `${process.env.FRONTEND_URL}/oauth-success?token=${token}`
        );
      } catch (error) {
        console.error("Google login error:", error);
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(
            "Google authentication error"
          )}`
        );
      }
    })(req, res, next);
  }
);

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already used" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash: hash });
    const token = generateToken(user);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Something went wrong, try again later." });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash || "");
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Something went wrong, try again later." });
  }
});

// 🔹 Pagination Example: Get Users
router.get("/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // items per page
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).select("-passwordHash"),
      User.countDocuments(),
    ]);

    res.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Users fetch error:", err);
    res.status(500).json({ message: "Unable to fetch users" });
  }
});

export default router;
