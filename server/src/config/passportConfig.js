import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || (process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/users/auth/google/callback` : "http://localhost:3000/api/users/auth/google/callback"),
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });
        
        if (!user) {
          // Create new user if not exists
          user = await User.create({
            username: profile.displayName.replace(/\s+/g, '_').toLowerCase() + Math.floor(Math.random() * 1000), // Ensure unique username
            email,
            googleId: profile.id,
            avatar: profile.photos[0]?.value,
            authProvider: "google",
            isVerified: true,
          });
        } else if (!user.googleId) {
          // If user exists with email but no googleId, link them
          user.googleId = profile.id;
          user.authProvider = "google";
          user.isVerified = true;
          if (!user.avatar) user.avatar = profile.photos[0]?.value;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Required for passport sessions (though we use JWT, passport still likes these)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export default passport;