import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const TrackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A track must be associated with a user"],
    },
    name: {
      type: String,
      required: [true, "Please provide a name for the tracked item"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "Please provide the URL to track"],
      trim: true,
    },
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: [true, "Please specify the site associated with this URL"],
    },
    type: {
      type: String,
      required: [true, "Please specify the type (product or stock)"],
      enum: {
        values: ["product", "stock"],
        message: "{VALUE} is not a supported type",
      },
    },
    image: {
      type: String,
    },
    demandPrice: {
      type: Number,
      required: [true, "Please specify your target demand price"],
    },
    lowestPriceEver: {
      type: Number,
      default: null,
    },
    history: [HistorySchema],
    informed: {
      type: Boolean,
      default: false,
    },
    telegramChatId: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for faster lookups
TrackSchema.index({ user: 1 });
TrackSchema.index({ url: 1 });

export default mongoose.model("Track", TrackSchema);
