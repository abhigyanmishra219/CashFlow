import mongoose, { Schema } from "mongoose";

const LostLeadCounterSchema = new Schema(
  {
    date: {
      type: String,
      required: [true, "Date is required"],
      unique: true,
    },
    count: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

const LostLeadCounter = mongoose.models.LostLeadCounter || mongoose.model("LostLeadCounter", LostLeadCounterSchema);

export default LostLeadCounter;
