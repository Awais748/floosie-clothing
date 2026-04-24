import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, unique: true, trim: true },
    category: {
      type: String,
      enum: ["Kohinoor", "FlossieExecutive", "Safeera", "Velvet", "Dastaan"],
      required: true,
    },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    salePrice: { type: Number, default: null },
    images: [{ type: String }],
    sizes: [{ type: String }],
    colors: [{ type: String }],
    stock: { type: Number, default: 0 },
    isCustomerFavorite: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ isNewArrival: 1, createdAt: -1 });
productSchema.index({ isCustomerFavorite: 1 });
productSchema.index({ name: "text", code: "text", description: "text" });

const Product = mongoose.model("Product", productSchema, "floosie-products");
export default Product;
