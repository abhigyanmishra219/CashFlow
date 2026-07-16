import mongoose, { Schema } from "mongoose";

const PaymentSchema = new Schema(
  {
    receiptNo: {
      type: String,
      unique: true,
    },
    admissionId: {
      type: Schema.Types.ObjectId,
      ref: "Admission",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    amountReceived: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMode: {
      type: String,
      required: true,
    },
    referenceNo: {
      type: String,
    },
    remarks: {
      type: String,
    },
    company: {
      type: String,
    },
    particulars: {
      courseFeeDue: { type: Number, default: 0 },
      registrationFeeDue: { type: Number, default: 0 },
      materialFeeDue: { type: Number, default: 0 },
      examFeeDue: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate receiptNo before saving
PaymentSchema.pre("save", async function () {
  if (!this.receiptNo) {
    const count = await mongoose.models.Payment.countDocuments();
    const currentYear = new Date().getFullYear();
    this.receiptNo = `REC-${currentYear}-${String(count + 1).padStart(5, "0")}`;
  }
});

// Clear the mongoose model if it already exists to fix Next.js HMR caching old hooks
if (mongoose.models.Payment) {
  delete mongoose.models.Payment;
}
const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;
