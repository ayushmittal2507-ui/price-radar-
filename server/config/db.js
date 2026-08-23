import mongoose from "mongoose";
import Site from "../models/SiteModel.js";

const seedDefaultSites = async () => {
  try {
    const count = await Site.countDocuments();
    if (count === 0) {
      const defaultSites = [
        {
          name: "Amazon",
          type: "product",
          priceLocation: ".a-price .a-offscreen, #priceblock_ourprice, #priceblock_dealprice, .priceToPay .a-price-whole",
          nameLocation: "#productTitle, h1.a-size-large",
          imageLocation: "#landingImage, #imgBlkFront, #main-image",
        },
        {
          name: "Flipkart",
          type: "product",
          priceLocation: "._30jeq3._16J063, ._30jeq3, div.Nx9bqj",
          nameLocation: ".B_NuCI, span.VU-ZEz, ._2NKhZn",
          imageLocation: "._396cs4._16LucQ, img._53J4C-, img.DByuf4",
        },
        {
          name: "Demo Books Store (books.toscrape.com)",
          type: "product",
          priceLocation: "p.price_color",
          nameLocation: "h1",
          imageLocation: "div.item.active img, .thumbnail img",
        },
        {
          name: "Yahoo Finance (Stock)",
          type: "stock",
          priceLocation: "fin-streamer[data-field='regularMarketPrice'], span[data-testid='qsp-price']",
          nameLocation: "h1.yf-xxplace, h1",
          imageLocation: "img.logo",
        },
      ];
      await Site.insertMany(defaultSites);
      console.log("🌱 Default e-commerce & stock sites seeded successfully.");
    }
  } catch (err) {
    console.warn("⚠️  Site seeding note:", err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅  MongoDB connected → ${conn.connection.host}/${conn.connection.name}`);
    await seedDefaultSites();
  } catch (err) {
    console.error(`❌  MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
