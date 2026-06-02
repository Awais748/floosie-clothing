import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { generateOTP } from "../utils/generateToken.js";
import Product from "../models/ProductModel.js";
import { sendEmail } from "../utils/sendEmails.js";

const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const createUserController = async (req, res) => {
  console.log("REGISTER: Request received", { body: req.body });
  const { FirstName, LastName, Email, Password, Gender, role } = req.body;

  if (!FirstName) {
    console.warn("REGISTER: FirstName missing");
    return res
      .status(400)
      .json({ success: false, message: "First Name is required" });
  }
  if (!LastName) {
    console.warn("REGISTER: LastName missing");
    return res
      .status(400)
      .json({ success: false, message: "Last Name is required" });
  }
  if (!Email) {
    console.warn("REGISTER: Email missing");
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }
  if (!Password) {
    console.warn("REGISTER: Password missing");
    return res
      .status(400)
      .json({ success: false, message: "Password is required" });
  }
  if (!Gender) {
    console.warn("REGISTER: Gender missing");
    return res
      .status(400)
      .json({ success: false, message: "Gender selection is required" });
  }

  try {
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      console.warn("REGISTER: Email already registered", { Email });
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    const activationToken = crypto.randomBytes(20).toString("hex");

    const user = await User.create({
      FirstName,
      LastName,
      Email,
      Password: hashedPassword,
      Gender,
      role: ["admin", "manager"].includes(role) ? role : "user",
      activationToken,
    });

    console.log("REGISTER: User created successfully", {
      id: user._id,
      Email,
      role: user.role,
    });

    const activationLink = `${process.env.BACKEND_URL.replace(
      /\/$/,
      ""
    )}/api/users/activate/${activationToken}`;
    console.log("REGISTER: Activation link generated", { activationLink });

    try {
      await sendEmail(
        Email,
        "Activate Your FLOSSIE Account",
        `Welcome to FLOSSIE! Click here to activate: ${activationLink}`,
        `<div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 40px; text-align: center; color: #1a1a1a;">
      <h1 style="font-size: 28px; letter-spacing: 4px; margin-bottom: 30px; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px; display: inline-block;">FLOSSIE</h1>
      <p style="font-size: 16px; line-height: 1.6; color: #333;">Welcome to FLOSSIE, ${FirstName}.</p>
      <p style="font-size: 14px; color: #666; margin-bottom: 40px;">Thank you for joining our community. Please verify your email to begin your journey.</p>
      <a href="${activationLink}" style="background-color: #1a1a1a; color: white; padding: 15px 40px; text-decoration: none; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">Activate Account</a>
    </div>`
      );
      console.log("REGISTER: Activation email sent to", Email);
    } catch (err) {
      console.error("REGISTER: Email failed", err.message);
    }

    console.log("REGISTER: Registration successful", { Email });
    res.status(201).json({
      success: true,
      message: "Registration successful. Check your email to activate.",
    });
  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const activateAccountController = async (req, res) => {
  console.log("ACTIVATE_ACCOUNT: Request received", {
    token: req.params.token,
  });
  try {
    const { token } = req.params;
    const user = await User.findOne({ activationToken: token });

    if (!user) {
      console.warn("ACTIVATE_ACCOUNT: Invalid or expired token", { token });
      return res
        .status(400)
        .send("<h1>Invalid or expired activation link</h1>");
    }

    user.isActive = true;
    user.activationToken = undefined;
    await user.save();

    console.log("ACTIVATE_ACCOUNT: Account activated successfully", {
      id: user._id,
      Email: user.Email,
    });

    const frontendUrl =
      process.env.FRONTEND_URL?.replace(/\/$/, "") || "http://localhost:5173";
    const redirectUrl = `${frontendUrl}/login`;

    console.log("ACTIVATE_ACCOUNT: Redirecting to", { redirectUrl });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
        <style>
          body { 
            text-align: center; 
            font-family: 'Playfair Display', serif; 
            background-color: #fafaf9;
            color: #1c1917;
            padding-top: 15vh;
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .container {
            background: white;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.03);
            max-width: 400px;
            border: 1px solid #f5f5f4;
          }
          h1 { font-size: 32px; font-weight: 300; font-style: italic; margin-bottom: 20px; }
          p { color: #78716c; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 30px; }
          .loader {
            width: 40px;
            height: 40px;
            border: 2px solid #f5f5f4;
            border-top: 2px solid #1c1917;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Account Activated</h1>
          <p>Redirecting to login...</p>
          <div class="loader"></div>
        </div>
        <script>
          setTimeout(() => { window.location.href = "${redirectUrl}"; }, 3000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("ACTIVATE_ACCOUNT_ERROR:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const userLoginController = async (req, res) => {
  console.log("LOGIN: Request received", { Email: req.body.Email });
  const { Email, Password } = req.body;

  try {
    if (
      process.env.ADMIN_EMAIL &&
      Email === process.env.ADMIN_EMAIL &&
      Password === process.env.ADMIN_PASSWORD
    ) {
      console.log("LOGIN: Admin bypass used", { Email });
      const token = jwt.sign({ id: "admin-bypass" }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      return res.status(200).json({
        success: true,
        token,
        user: { id: "admin", FirstName: "Admin", role: "admin", Email: Email },
      });
    }

    const user = await User.findOne({ Email });
    if (!user || !(await bcrypt.compare(Password, user.Password))) {
      console.warn("LOGIN: Invalid credentials", { Email });
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isActive) {
      console.warn("LOGIN: Account not activated", { Email });
      return res.status(400).json({
        success: false,
        message: "Account not activated. Check your email.",
      });
    }

    const token = generateToken(user._id, user.Email);
    console.log("LOGIN: Login successful", {
      id: user._id,
      Email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        role: user.role,
        Avatar: user.Avatar,
      },
    });
  } catch (error) {
    console.error("LOGIN_ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateUserController = async (req, res) => {
  console.log("FORGOT_PASSWORD: Request received", { Email: req.body.Email });
  const { Email } = req.body;
  try {
    const user = await User.findOne({ Email });
    if (!user) {
      console.warn("FORGOT_PASSWORD: User not found", { Email });
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const otp = generateOTP();
    user.resetOTP = otp;
    user.resetOTPExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    console.log("FORGOT_PASSWORD: OTP generated and saved", { Email });

    try {
      await sendEmail(Email, "Password Reset OTP", `Your OTP is: ${otp}`);
      console.log("FORGOT_PASSWORD: OTP email sent to", Email);
    } catch (err) {
      console.error("FORGOT_PASSWORD: Email failed", err.message);
    }

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const resetPasswordController = async (req, res) => {
  console.log("RESET_PASSWORD: Request received", { Email: req.body.Email });
  const { Email, OTP, newPassword } = req.body;
  try {
    const user = await User.findOne({ Email, resetOTP: OTP });
    if (!user || user.resetOTPExpire < Date.now()) {
      console.warn("RESET_PASSWORD: Invalid or expired OTP", { Email });
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    user.Password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = undefined;
    user.resetOTPExpire = undefined;
    await user.save();

    console.log("RESET_PASSWORD: Password reset successfully", { Email });
    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getUserProfile = async (req, res) => {
  console.log("GET_PROFILE: Request received", { userId: req.user?.id });
  try {
    if (req.user && req.user._id === "admin-bypass") {
      console.log("GET_PROFILE: Admin bypass profile returned");
      return res.json({
        id: "admin",
        FirstName: "Admin",
        role: "admin",
        Email: process.env.ADMIN_EMAIL,
      });
    }

    const user = await User.findById(req.user.id).select("-Password");
    if (!user) {
      console.warn("GET_PROFILE: User not found", { userId: req.user?.id });
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log("GET_PROFILE: Profile fetched successfully", {
      id: user._id,
      Email: user.Email,
    });
    res.json(user);
  } catch (error) {
    console.error("GET_PROFILE_ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  console.log("UPDATE_PROFILE: Request received", {
    userId: req.user?.id,
    body: req.body,
  });
  try {
    if (req.user && req.user._id === "admin-bypass") {
      console.warn("UPDATE_PROFILE: Admin profile update attempted - blocked");
      return res
        .status(400)
        .json({ success: false, message: "Admin profile is static" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      console.warn("UPDATE_PROFILE: User not found", { userId: req.user?.id });
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (req.body.Password) {
      console.log("UPDATE_PROFILE: Password update requested", {
        userId: req.user?.id,
      });
      user.Password = await bcrypt.hash(req.body.Password, 10);
    }

    user.FirstName = req.body.FirstName || user.FirstName;
    user.LastName = req.body.LastName || user.LastName;
    user.Gender = req.body.Gender || user.Gender;
    user.Avatar = req.body.Avatar || user.Avatar;

    const updatedUser = await user.save();
    console.log("UPDATE_PROFILE: Profile updated successfully", {
      id: updatedUser._id,
    });
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("UPDATE_PROFILE_ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllOrders = async (req, res) => {
  console.log("GET_ALL_ORDERS: Request received");
  try {
    const users = await User.find({ "orders.0": { $exists: true } })
      .select("FirstName LastName Email orders")
      .lean();

    console.log(`GET_ALL_ORDERS: Found ${users.length} users with orders`);

    const allOrders = users.flatMap((user) =>
      user.orders.map((order) => ({
        _id: order._id,
        items: order.items,
        shippingDetails: order.shippingDetails,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        status: order.status,
        customerName: `${user.FirstName} ${user.LastName}`,
        customerEmail: user.Email,
        userId: user._id,
      }))
    );

    allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(`GET_ALL_ORDERS: Total orders fetched: ${allOrders.length}`);
    res
      .status(200)
      .json({ success: true, count: allOrders.length, orders: allOrders });
  } catch (error) {
    console.error("GET_ALL_ORDERS_ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const placeOrder = async (req, res) => {
  console.log("PLACE_ORDER: Request received", {
    userId: req.user?.id,
    totalPrice: req.body.totalPrice,
  });
  try {
    const { items, shippingDetails, totalPrice, clearCartFromDb } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      console.warn("PLACE_ORDER: User not found", { userId: req.user?.id });
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Order items are required" });
    }
    if (!shippingDetails || !totalPrice) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Shipping details and total price are required",
        });
    }

    // Decrement stock for each ordered item
    const stockUpdates = items.map((item) =>
      Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { new: true }
      )
    );
    await Promise.all(stockUpdates);
    console.log("PLACE_ORDER: Stock decremented for", items.length, "items");

    const newOrder = {
      items,
      shippingDetails,
      totalPrice,
      paymentMethod: "COD",
      status: "Pending",
      createdAt: new Date(),
    };

    user.orders.push(newOrder);
    if (clearCartFromDb) {
      console.log("PLACE_ORDER: Clearing cart from DB", {
        userId: req.user?.id,
      });
      user.cart = [];
    }

    await user.save();
    console.log("PLACE_ORDER: Order placed successfully", {
      userId: req.user?.id,
      totalPrice,
    });
    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("PLACE_ORDER_ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getOrders = async (req, res) => {
  console.log("GET_ORDERS: Request received", { userId: req.user?._id });
  try {
    const user = await User.findById(req.user._id).select("orders").lean();
    if (!user) {
      console.warn("GET_ORDERS: User not found", { userId: req.user?._id });
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log(`GET_ORDERS: Found ${user.orders?.length || 0} orders`, {
      userId: req.user?._id,
    });
    res.status(200).json(user.orders || []);
  } catch (error) {
    console.error("GET_ORDERS_ERROR:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  console.log("UPDATE_ORDER_STATUS: Request received", { body: req.body });
  try {
    const { userId, orderId, status } = req.body;

    if (!userId || !orderId || !status) {
      console.warn("UPDATE_ORDER_STATUS: Missing required fields", {
        userId,
        orderId,
        status,
      });
      return res.status(400).json({
        success: false,
        message: "userId, orderId and status are required",
      });
    }

    const normalisedStatus =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    console.log("UPDATE_ORDER_STATUS: Normalised status", {
      original: status,
      normalised: normalisedStatus,
    });

    const VALID = ["Pending", "Shipped", "Delivered", "Cancelled"];
    if (!VALID.includes(normalisedStatus)) {
      console.warn("UPDATE_ORDER_STATUS: Invalid status value", {
        normalisedStatus,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn("UPDATE_ORDER_STATUS: User not found", { userId });
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const order = user.orders.id(orderId);
    if (!order) {
      console.warn("UPDATE_ORDER_STATUS: Order not found", { orderId });
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = normalisedStatus;
    await user.save();

    console.log("UPDATE_ORDER_STATUS: Status updated successfully", {
      orderId,
      status: normalisedStatus,
    });
    res.status(200).json({
      success: true,
      message: "Order status updated",
      updatedOrder: {
        _id: orderId,
        userId: userId.toString(),
        status: normalisedStatus,
      },
    });
  } catch (error) {
    console.error("UPDATE_ORDER_STATUS_ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
