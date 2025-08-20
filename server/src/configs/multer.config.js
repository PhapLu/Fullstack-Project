import multer from "multer";
import path from "path";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes

const uploadDisk = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "./src/uploads/");
        },
        filename: function (req, file, cb) {
            cb(null, `${Date.now()}-${file.originalname}`);
        },
    }),
    limits: { fileSize: MAX_FILE_SIZE - 1 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ext = path.extname(file.originalname).toLowerCase();
        const mimeOk = /^image\/(jpeg|png|gif|webp)$/.test(file.mimetype);
        if (allowed.test(ext) && mimeOk) return cb(null, true);
        cb(new Error('Only image files are allowed'));
    }
});

const uploadMemory = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE - 1, // Ensures file size is strictly < 15MB
    },
});

const uploadFields = uploadMemory.fields([
    { name: "files", maxCount: 5 },
    { name: "artworks", maxCount: 10 },
    { name: "media", maxCount: 5 },
    { name: "thumbnail", maxCount: 1 },
    { name: "portfolioLink", maxCount: 1 },
    { name: "stageName", maxCount: 1 },
    { name: "price", maxCount: 1 },
    { name: "jobTitle", maxCount: 1 },
    { name: "title", maxCount: 1 },
    { name: "fromPrice", maxCount: 1 },
    { name: "deliverables", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
    { name: "accessory", maxCount: 1 },
    { name: "skin", maxCount: 1 },
    { name: "characterId", maxCount: 1},
    { name: "newArtworks", maxCount: 5},
]);

export { uploadDisk, uploadFields, uploadMemory };