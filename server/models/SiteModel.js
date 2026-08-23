import mongoose from "mongoose";

const SiteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a site name (e.g., Amazon, Flipkart)"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Please specify the type (product or stock)"],
      enum: {
        values: ["product", "stock"],
        message: "{VALUE} is not a supported type",
      },
    },
    priceLocation: {
      type: String,
      required: [true, "Please provide the CSS selector/path for the price"],
    },
    nameLocation: {
      type: String,
      required: [true, "Please provide the CSS selector/path for the product/stock name"],
    },
    imageLocation: {
      type: String,
      required: [true, "Please provide the CSS selector/path for the image"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

export default mongoose.model("Site", SiteSchema);
