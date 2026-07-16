import mongoose, { Schema } from "mongoose";

const CounsellorSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Corporate email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
    },
    photoUrl: {
      type: String,
      trim: true,
    },
    brandScope: {
      type: String,
      required: [true, "Brand scope is required"],
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    annualTarget: {
      type: Number,
      required: [true, "Annual target is required"],
      default: 500000,
    },
    currentRevenue: {
      type: Number,
      default: 0,
    },
    admissionsRecorded: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      required: [true, "Temporary password is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent compiled model re-definition errors in Next.js development hot-reloads
const Counsellor = mongoose.models.Counsellor || mongoose.model("Counsellor", CounsellorSchema);

export default Counsellor;
