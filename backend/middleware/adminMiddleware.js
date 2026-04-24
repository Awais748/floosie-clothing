const adminOnly = (req, res, next) => {
  console.log("ADMIN_ONLY: Checking role", { userId: req.user?.id, role: req.user?.role });
  if (req.user && req.user.role === "admin") {
    console.log("ADMIN_ONLY: Access granted", { userId: req.user?.id });
    next();
  } else {
    console.warn("ADMIN_ONLY: Access denied", { userId: req.user?.id, role: req.user?.role });
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};

const adminOrManager = (req, res, next) => {
  console.log("ADMIN_OR_MANAGER: Checking role", { userId: req.user?.id, role: req.user?.role });
  if (req.user && (req.user.role === "admin" || req.user.role === "manager")) {
    console.log("ADMIN_OR_MANAGER: Access granted", { userId: req.user?.id, role: req.user?.role });
    next();
  } else {
    console.warn("ADMIN_OR_MANAGER: Access denied", { userId: req.user?.id, role: req.user?.role });
    res.status(403).json({
      success: false,
      message: "Permission nahi hai",
    });
  }
};

export { adminOnly, adminOrManager };