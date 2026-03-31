import jwt from "jsonwebtoken";
import userSchema from "../models/UserModel.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      if (!token || token === "null" || token === "undefined") {
        return res.status(401).json({ message: "Not authorized, invalid token format" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.id === "admin-bypass") {
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
      }

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error("AUTH_ERROR:", error.message);
      return res.status(401).json({ 
        message: "Not authorized, token failed", 
        error: error.message 
      });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};


export { protect };
