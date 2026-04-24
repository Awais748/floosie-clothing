import jwt from "jsonwebtoken";
import userSchema from "../models/UserModel.js";

const protect = async (req, res, next) => {
  console.log("PROTECT: Request received", {
    url: req.originalUrl,
    method: req.method,
  });
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      if (!token || token === "null" || token === "undefined") {
        console.warn("PROTECT: Invalid token format", { token });
        return res
          .status(401)
          .json({ message: "Not authorized, invalid token format" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("PROTECT: Token verified", { decodedId: decoded.id });

      if (decoded.id === "admin-bypass") {
        console.log("PROTECT: Admin bypass detected");
        req.user = {
          _id: "admin-bypass",
          id: "admin",
          FirstName: "bat",
          LastName: "man",
          Email: process.env.ADMIN_EMAIL,
          Gender: "male",
          role: "admin",
          Avatar: "",
        };
      } else {
        req.user = await userSchema.findById(decoded.id).select("-Password");
        console.log("PROTECT: User fetched from DB", {
          userId: req.user?._id,
          role: req.user?.role,
        });
      }

      if (!req.user) {
        console.warn("PROTECT: User not found in DB", {
          decodedId: decoded.id,
        });
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      console.log("PROTECT: Access granted", {
        userId: req.user?._id,
        role: req.user?.role,
      });
      next();
    } catch (error) {
      console.error("PROTECT_ERROR:", error.message);
      return res.status(401).json({
        message: "Not authorized, token failed",
        error: error.message,
      });
    }
  } else {
    console.warn("PROTECT: No token provided", { url: req.originalUrl });
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }
};

export { protect };
