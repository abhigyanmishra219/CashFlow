import mongoose, { Schema } from "mongoose";

const CompanySchema = new Schema(
  {
    companyId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Company Name is required"],
      trim: true,
    },
    legalName: {
      type: String,
      trim: true,
    },
    gst: {
      type: String,
      default: "Not Provided",
      trim: true,
    },
    pan: {
      type: String,
      default: "Not Provided",
      trim: true,
    },
    bank: {
      type: String,
      default: "Bank Of India",
      trim: true,
    },
    annualCapacityCap: {
      type: Number,
      default: 1949999,
    },
    collectedRevenue: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      default: "No listed street, No City, No State, PIN",
      trim: true,
    },
    brand: {
      type: String,
      default: "Design Gateway",
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

CompanySchema.pre("save", async function () {
  if (!this.companyId) {
    const count = await mongoose.models.Company.countDocuments();
    this.companyId = `COMP-${Date.now()}${count + 1}`;
  }
});

const Company = mongoose.models.Company || mongoose.model("Company", CompanySchema);

export default Company;
