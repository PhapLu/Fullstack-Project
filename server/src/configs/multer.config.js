// server/src/utils/uploader.js
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_FILE_SIZE = 15 * 1024 * 1024;

const ROOT_DIR     = path.resolve(__dirname, "..", "..");   // -> server/
export const UPLOADS_DIR  = path.join(ROOT_DIR, "uploads"); // -> server/uploads
export const AVATARS_DIR  = path.join(UPLOADS_DIR, "avatars");

const ensureDir = (dir) => fs.mkdir(dir, { recursive: true });

const fileFilter = (req, file, cb) => {
    const extOk = /\.(jpe?g|png|gif|webp)$/i.test(file.originalname);
    const mimeOk = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    cb(new Error("Only image files are allowed"));
};

// 🔹 set per-route subdir: req._uploadSubdir = 'avatars' | 'products' | ...
export const useUploadDir =
    (subdir = "") =>
    (req, _res, next) => {
        req._uploadSubdir = subdir;
        next();
    };

const storage = multer.diskStorage({
    async destination(req, _file, cb) {
        try {
            const sub = req._uploadSubdir || "misc";
            const dir = path.join(UPLOADS_DIR, sub);
            await ensureDir(dir);
            cb(null, dir);
        } catch (err) {
            cb(err);
        }
    },
    filename(req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const uid = req.userId || "anon";
        cb(null, `${uid}-${Date.now()}${ext}`);
    },
});

export const uploadDisk = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE - 1 },
    fileFilter,
});
