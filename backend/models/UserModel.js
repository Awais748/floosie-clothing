import mongoose, { Schema } from "mongoose";
const userModel = new Schema(
  {
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    Gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "manager"],
    },
    Avatar: { type: String },
    isActive: { type: Boolean, default: false },
    activationToken: { type: String },
    resetOTP: { type: String },
    resetOTPExpire: { type: Date },
    orders: [
      {
        items: [
          {
            productId: { type: Schema.Types.ObjectId, ref: "Product" },
            name: String,
            price: Number,
            quantity: Number,
            image: String,
            size: String,
            color: String,
          },
        ],
        shippingDetails: {
          fullName: String,
          email: String,
          address: String,
          city: String,
          state: String,
          zip: String,
          phone: String,
          method: String,
        },
        totalPrice: Number,
        paymentMethod: { type: String, default: "COD" },
        status: { type: String, default: "Pending" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    cart: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        originalPrice: Number,
        image: String,
        category: String,
        size: String,
        color: String,
        quantity: { type: Number, default: 1 },
      },
    ],
  },

  { timestamps: true }
);

userModel.index({ "orders.createdAt": -1 }, { sparse: true });
const userSchema = mongoose.model("Users", userModel, "floosie-user");

export default userSchema;
