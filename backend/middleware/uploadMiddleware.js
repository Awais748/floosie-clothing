import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("MULTER: Saving file to uploads/", {
      originalname: file.originalname,
    });
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log("MULTER: Filename generated", { filename });
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("MULTER: Checking file type", {
    mimetype: file.mimetype,
    originalname: file.originalname,
  });
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    console.log("MULTER: File type accepted", { mimetype: file.mimetype });
    cb(null, true);
  } else {
    console.warn("MULTER: File type rejected", {
      mimetype: file.mimetype,
      originalname: file.originalname,
    });
    cb(
      new Error("Invalid file type. Only JPEG, PNG, JPG and WEBP are allowed."),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

console.log("MULTER: Upload middleware initialized", {
  maxFileSize: "5MB",
  allowedTypes: ["jpeg", "png", "jpg", "webp"],
});

export default upload;
