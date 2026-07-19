import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
    },
    logoUrl: {
      type: String,
    },
    description: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    website: {
      type: String,
    },
    address: {
      type: String,
    },
    status: {
      type: String,
      default: "ACTIVE",
      enum: ["ACTIVE", "INACTIVE"],
    },
    companies: {
      type: [String],
      default: [],
    },
    brandId: {
      type: String,
      unique: true,
    }
  },
  { timestamps: true }
);

// Pre-save hook to generate unique brandId if not provided
BrandSchema.pre("save", async function () {
  if (!this.brandId) {
    this.brandId = `BRD-${Date.now()}`;
  }
  if (!this.code) {
    this.code = this.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  }
});

if (mongoose.models.Brand) {
  delete mongoose.models.Brand;
}

const Brand = mongoose.model("Brand", BrandSchema);

export default Brand;
