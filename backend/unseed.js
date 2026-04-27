import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDataBase from "./Config/Database.js";
import Product from "./models/ProductModel.js";

dotenv.config();

const unseed = async () => {
  await connectDataBase();
  await Product.deleteMany({});
  console.log("✅ All products deleted!");
  process.exit(0);
};

unseed();