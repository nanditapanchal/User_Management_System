import dotenv from "dotenv";
dotenv.config();
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        // 1️⃣ Check if user exists with googleId
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // 2️⃣ Check if user exists with same email
        const existingByEmail = await User.findOne({ email });

        if (existingByEmail) {
          // 🚨 Case: same email already used for password signup
          if (existingByEmail.passwordHash && !existingByEmail.googleId) {
            return done(null, false, { message: "Email already registered. Please log in with email & password." });
          }

          // ✅ Case: maybe Google account without googleId linked → update it
          existingByEmail.googleId = profile.id;
          await existingByEmail.save();
          return done(null, existingByEmail);
        }

        // 3️⃣ If no user exists at all → create new Google user
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email,
        });

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);
