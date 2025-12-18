import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import HttpError from "../utils/HttpError.js";

const imagesFolder = path.join(process.cwd(), "public", "images");
fs.mkdirSync(imagesFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, imagesFolder),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

const limits = { fileSize: 10 * 1024 * 1024 };

const allowedMime = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const allowedExt = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedMime.has(file.mimetype) || !allowedExt.has(ext)) {
    return cb(HttpError(400, "Only jpg/png/webp allowed"));
  }

  cb(null, true);
};

const upload = multer({ storage, limits, fileFilter });
export default upload;