import mongoose, { Schema } from "mongoose";

const EnquirySchema = new Schema(
  {
    enquiryId: {
      type: String,
      unique: true,
    },
    studentFullName: {
      type: String,
      required: [true, "Student Full Name is required"],
      trim: true,
    },
    primaryPhoneMobile: {
      type: String,
      required: [true, "Primary Phone Mobile is required"],
      trim: true,
    },
    parentsFullName: {
      type: String,
      trim: true,
    },
    parentsPhoneNumber: {
      type: String,
      trim: true,
    },
    emailAddress: {
      type: String,
      trim: true,
      lowercase: true,
    },
    currentCity: {
      type: String,
      trim: true,
    },
    targetBrand: {
      type: String,
      required: [true, "Target Brand is required"],
    },
    targetCourse: {
      type: String,
      required: [true, "Target Course is required"],
    },
    assignedCrmAdvisor: {
      type: String,
      required: [true, "Assigned CRM Advisor is required"],
    },
    leadSource: {
      type: String,
    },
    expectedCourseFee: {
      type: String,
      default: "₹0",
    },
    priorityLevel: {
      type: String,
      default: "Medium",
    },
    remarks: {
      type: String,
    },
    followUps: [
      {
        date: String,
        time: String,
        priority: String,
        typeOfContact: String,
        remarks: String,
        status: { type: String, default: "Pending" },
        plannedBy: String,
        isCompleted: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    followUpNotes: {
      type: String,
    },
    status: {
      type: String,
      default: "New",
    }
  },
  {
    timestamps: true,
  }
);

// Auto-generate enquiryId before saving if not present
EnquirySchema.pre("save", async function () {
  if (!this.enquiryId) {
    // Generate an ID like ENQ000001
    const count = await mongoose.models.Enquiry.countDocuments();
    this.enquiryId = `ENQ${String(count + 1).padStart(6, "0")}`;
  }
});

// Clear the mongoose model if it already exists to fix Next.js HMR caching old hooks
if (mongoose.models.Enquiry) {
  delete mongoose.models.Enquiry;
}
const Enquiry = mongoose.model("Enquiry", EnquirySchema);

export default Enquiry;
