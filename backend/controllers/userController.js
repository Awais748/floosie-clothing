import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { generateOTP } from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmails.js";

// Helper to generate JWT
const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register new user
// @route   POST /api/users/register
export const createUserController = async (req, res) => {
  console.log("REGISTRATION_BODY:", req.body);
  const { FirstName, LastName, Email, Password, Gender, role } = req.body;

  if (!FirstName)
    return res
      .status(400)
      .json({ success: false, message: "First Name is required" });
  if (!LastName)
    return res
      .status(400)
      .json({ success: false, message: "Last Name is required" });
  if (!Email)
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  if (!Password)
    return res
      .status(400)
      .json({ success: false, message: "Password is required" });
  if (!Gender)
    return res
      .status(400)
      .json({ success: false, message: "Gender selection is required" });

  try {
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
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

    const activationLink = `${process.env.BACKEND_URL.replace(
      /\/$/,
      ""
    )}/api/users/activate/${activationToken}`;

    sendEmail(
      Email,
      "Activate Your FLOSSIE Account",
      `Welcome to FLOSSIE! Click here to activate: ${activationLink}`,
      `<div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 40px; text-align: center; color: #1a1a1a;">
        <h1 style="font-size: 28px; letter-spacing: 4px; margin-bottom: 30px; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px; display: inline-block;">FLOSSIE</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Welcome to FLOSSIE, ${FirstName}.</p>
        <p style="font-size: 14px; color: #666; margin-bottom: 40px;">Thank you for joining our community. Please verify your email to begin your journey.</p>
        <a href="${activationLink}" style="background-color: #1a1a1a; color: white; padding: 15px 40px; text-decoration: none; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">Activate Account</a>
      </div>`
    ).catch((err) => console.error("Email Error:", err));

    res.status(201).json({
      success: true,
      message: "Registration successful. Check your email to activate.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Activate account
// @route   GET /api/users/activate/:token
export const activateAccountController = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ activationToken: token });

    if (!user) {
      return res
        .status(400)
        .send("<h1>Invalid or expired activation link</h1>");
    }

    user.isActive = true;
    user.activationToken = undefined;
    await user.save();

    const frontendUrl =
      process.env.FRONTEND_URL?.replace(/\/$/, "") || "http://localhost:5173";
    const redirectUrl = `${frontendUrl}/login`;

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
    res.status(500).send("Internal Server Error");
  }
};

// @desc    Login user
// @route   POST /api/users/login
export const userLoginController = async (req, res) => {
  const { Email, Password } = req.body;

  try {
    // Admin Bypass Logic
    if (
      process.env.ADMIN_EMAIL &&
      Email === process.env.ADMIN_EMAIL &&
      Password === process.env.ADMIN_PASSWORD
    ) {
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
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: "Account not activated. Check your email.",
      });
    }

    const token = generateToken(user._id, user.Email);

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
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/users/forgot-password
export const updateUserController = async (req, res) => {
  const { Email } = req.body;
  try {
    const user = await User.findOne({ Email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const otp = generateOTP();
    user.resetOTP = otp;
    user.resetOTPExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    sendEmail(Email, "Password Reset OTP", `Your OTP is: ${otp}`).catch((err) =>
      console.error(err)
    );
    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Reset Password
// @route   POST /api/users/reset-password
export const resetPasswordController = async (req, res) => {
  const { Email, OTP, newPassword } = req.body;
  try {
    const user = await User.findOne({ Email, resetOTP: OTP });
    if (!user || user.resetOTPExpire < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    user.Password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = undefined;
    user.resetOTPExpire = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Get User Profile
// @route   GET /api/users/profile
export const getUserProfile = async (req, res) => {
  try {
    if (req.user && req.user._id === "admin-bypass") {
      return res.json({
        id: "admin",
        FirstName: "Admin",
        role: "admin",
        Email: process.env.ADMIN_EMAIL,
      });
    }

    const user = await User.findById(req.user.id).select("-Password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Update User Profile
// @route   PUT /api/users/profile
export const updateUserProfile = async (req, res) => {
  try {
    if (req.user && req.user._id === "admin-bypass") {
      return res
        .status(400)
        .json({ success: false, message: "Admin profile is static" });
    }

    const user = await User.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (req.body.Password) {
      user.Password = await bcrypt.hash(req.body.Password, 10);
    }

    user.FirstName = req.body.FirstName || user.FirstName;
    user.LastName = req.body.LastName || user.LastName;
    user.Gender = req.body.Gender || user.Gender;
    user.Avatar = req.body.Avatar || user.Avatar;

    const updatedUser = await user.save();
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Get all orders from all users (Admin only)
// @route   GET /api/users/all-orders
// @access  Admin
export const getAllOrders = async (req, res) => {
  try {
    // Sirf users fetch karo jinke pass orders hain
    const users = await User.find({ "orders.0": { $exists: true } })
      .select("FirstName LastName Email orders")
      .lean();

    // Sab users ke orders ko ek single array me convert karo
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

    res.status(200).json({
      success: true,
      count: allOrders.length,
      orders: allOrders,
    });
  } catch (error) {
    console.error("GET_ALL_ORDERS_ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// @desc    Place Order
// @route   POST /api/users/orders
export const placeOrder = async (req, res) => {
  try {
    const { items, shippingDetails, totalPrice, clearCartFromDb } = req.body;
    const user = await User.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const newOrder = {
      items,
      shippingDetails,
      totalPrice,
      paymentMethod: "COD",
      status: "Pending",
      createdAt: new Date(),
    };

    user.orders.push(newOrder);
    if (clearCartFromDb) user.cart = [];

    await user.save();
    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("orders").lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json(user.orders || []);
  } catch (error) {
    console.error("GET_ORDERS_ERROR:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Update Order Status (Admin only)
// @route   PUT /api/users/order-status
// @access  Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { userId, orderId, status } = req.body;

    if (!userId || !orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "userId, orderId and status are required",
      });
    }

    // Normalise to Title Case e.g. "pending" → "Pending"
    const normalisedStatus =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const VALID = ["Pending", "Shipped", "Delivered", "Cancelled"];
    if (!VALID.includes(normalisedStatus)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const order = user.orders.id(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = normalisedStatus;
    await user.save();

    // Return the updated order so the frontend can patch state immediately
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
