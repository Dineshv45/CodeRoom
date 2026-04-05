import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: function() {
        return !this.googleId; // Password required only if not using Google
      },
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null/missing values
    },

    avatar: {
      type: String,
    },

    authProvider: {
      type: String,
      enum: ["local", "google", "email"],
      default: "local",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken:String,
    verificationTokenExpiry:Date,

    refreshToken:String,
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
