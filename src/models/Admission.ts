import mongoose, { Schema } from "mongoose";

const AdmissionSchema = new Schema(
  {
    admissionId: {
      type: String,
      unique: true,
    },
    enquiryId: {
      type: Schema.Types.ObjectId,
      ref: "Enquiry",
    },
    // 1. Student Information
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    dob: { type: String },
    gender: { type: String },
    counsellor: { type: String, required: true },
    brand: { type: String },

    // 2. Course Details
    course: { type: String, required: true },
    batch: { type: String, required: true },
    duration: { type: String, required: true },
    startDate: { type: Date, required: true },
    academicYear: { type: String, required: true },
    admissionDate: { type: Date, required: true },
    companyAssigned: { type: String, required: true },

    // 3. Discount & Scholarship
    courseFee: { type: Number, required: true },
    scholarshipType: { type: String },
    scholarshipAmount: { type: Number, default: 0 },
    discountType: { type: String },
    discountAmount: { type: Number, default: 0 },
    additionalDiscount: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    finalFee: { type: Number, required: true },

    // 4. Payment & EMI
    paymentMode: { type: String, required: true },
    transactionNo: { type: String, required: true },
    amountReceivedToday: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    remainingBalance: { type: Number, required: true },
    hasEmi: { type: Boolean, default: false },
    numInstallments: { type: Number, default: 1 },
    installmentAmount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Auto-generate admissionId
AdmissionSchema.pre("save", async function () {
  if (!this.admissionId) {
    const count = await mongoose.models.Admission.countDocuments();
    this.admissionId = `ADM${String(count + 1).padStart(6, "0")}`;
  }
});

// Clear the mongoose model if it already exists to fix Next.js HMR caching old hooks
if (mongoose.models.Admission) {
  delete mongoose.models.Admission;
}
const Admission = mongoose.model("Admission", AdmissionSchema);

export default Admission;
