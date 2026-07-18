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
    brand: {
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
    const currentYear = new Date().getFullYear();
    const lastPayment = await mongoose.models.Payment.findOne({
      receiptNo: new RegExp(`^REC-${currentYear}-`)
    }).sort({ receiptNo: -1 });

    let nextNumber = 1;
    if (lastPayment && lastPayment.receiptNo) {
      const match = lastPayment.receiptNo.match(/-(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    
    this.receiptNo = `REC-${currentYear}-${String(nextNumber).padStart(5, "0")}`;
  }
});

// Clear the mongoose model if it already exists to fix Next.js HMR caching old hooks
if (mongoose.models.Payment) {
  delete mongoose.models.Payment;
}
const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;
