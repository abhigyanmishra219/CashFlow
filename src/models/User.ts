import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["super admin", "brand manager", "counsellor"],
      default: "super admin",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent compiled model re-definition errors in Next.js development hot-reloads
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
