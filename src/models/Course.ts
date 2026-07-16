import mongoose, { Schema } from "mongoose";

const CourseSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Course Name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Course Code is required"],
      unique: true,
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
    },
    fee: {
      type: String,
      required: [true, "Fee is required"],
      trim: true,
    },
    status: {
      type: String,
      default: "ACTIVE",
      enum: ["ACTIVE", "INACTIVE"],
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Course) {
  delete mongoose.models.Course;
}
const Course = mongoose.model("Course", CourseSchema);

export default Course;
