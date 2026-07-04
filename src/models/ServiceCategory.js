import mongoose from "mongoose";

const serviceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    imageFileId: {
      type: String
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      index: true
    },
    subCategories: [
      {
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
        imageUrl: { type: String, required: true },
        imageFileId: { type: String }
      }
    ]
  },
  { timestamps: true, collection: "service_categories" }
);

serviceCategorySchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    if (ret.subCategories && ret.subCategories.length > 0) {
      const activeSubs = ret.subCategories.filter((s) => s.status === "Active");
      if (activeSubs.length > 0) {
        ret.basePrice = Math.min(...activeSubs.map((s) => s.price));
      } else {
        ret.basePrice = Math.min(...ret.subCategories.map((s) => s.price));
      }
    } else {
      ret.basePrice = 0;
    }
    return ret;
  }
});

export const ServiceCategory = mongoose.model("ServiceCategory", serviceCategorySchema);
