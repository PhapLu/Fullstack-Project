import {
    AuthFailureError,
    BadRequestError,
    NotFoundError,
} from "../core/error.response.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import path from "path";
import fs from "fs/promises";
import { PRODUCTS_DIR, UPLOADS_DIR } from "../configs/multer.config.js";

export const productPublicUrlFor = (filename) =>
    `/public/products/${filename}`;

class ProductService {
    //-------------------CRUD----------------------------------------------------
    static createProduct = async (req) => {
        const userId = req.userId;
        const files = req.files || [];

        // 1. Check vendor
        const vendor = await User.findById(userId);
        if (!vendor) throw new AuthFailureError("You are not authenticated!");
        if (vendor.role !== "vendor")
            throw new AuthFailureError("Only vendors can create products");

        // 2. Validate body
        const {
            title,
            description,
            price,
            stock,
            status = "active",
        } = req.body;

        // Title: required, 10–20 chars
        if (!title?.trim()) throw new BadRequestError("Title is required");
        if (title.trim().length < 10 || title.trim().length > 20)
            throw new BadRequestError(
                "Title must be between 10 and 20 characters"
            );

        // Description: required, ≤500 chars
        if (!description?.trim())
            throw new BadRequestError("Description is required");
        if (description.trim().length > 500)
            throw new BadRequestError(
                "Description must be at most 500 characters"
            );

        // Price: positive number (>0)
        const pPrice = Number(price);
        if (!Number.isFinite(pPrice) || pPrice <= 0)
            throw new BadRequestError("Price must be a positive number");

        // Stock: integer ≥0
        const pStock = Number(stock);
        if (!Number.isInteger(pStock) || pStock < 0)
            throw new BadRequestError("Stock must be a non-negative integer");

        // Status: must be active|inactive
        if (!["active", "inactive"].includes(status))
            throw new BadRequestError("Invalid status");

        // 3. Upload images
        if (!files.length)
            throw new BadRequestError("At least one product image is required");
        const images = files.map((f) =>
            productPublicUrlFor(f.filename || path.basename(f.path))
        );

        // 4. Create product
        // Prevent accidental duplicate creation (double-submit in <5s)
        const duplicate = await Product.findOne({
            vendorId: userId,
            title: title.trim(),
            createdAt: { $gt: new Date(Date.now() - 5000) },
        });
        if (duplicate) return { product: duplicate };

        const product = await Product.create({
            vendorId: userId,
            title: title,
            description: description.trim(),
            price: pPrice,
            stock: pStock,
            images,
            status,
        });

        return {
            product,
        };
    };

    static readProduct = async (req) => {
        const { productId } = req.params;

        const product = await Product.findById(productId)
            .populate("vendorId", "vendorProfile.businessName avatar email")
            .lean();
        if (!product) throw new NotFoundError("Product not found");
        return {
            product,
        };
    };

    static readProfileProducts = async (req) => {
        const vendorId = req.params.vendorId;

        // 1. Check user, vendor
        const vendor = await User.findById(vendorId);
        if (!vendor || vendor.role !== "vendor")
            throw new NotFoundError("Vendor not found");

        // 2. Get products
        const products = await Product.find({ vendorId })
            .sort({ createdAt: -1 })
            .lean();

        return {
            products,
        };
    };

    static searchProducts = async (req) => {
        const q = req.query;

        // --- Base filters ---
        const filters = {};

        // Title search
        if (q.search) {
            filters.title = { $regex: q.search, $options: "i" };
        }

        // Vendor filter
        if (q.vendorId) {
            filters.vendorId = q.vendorId;
        }

        // Price filters
        if (q.min || q.max) {
            filters.price = {};
            if (q.min) filters.price.$gte = Number(q.min);
            if (q.max) filters.price.$lte = Number(q.max);
        }

        // --- Sorting logic ---
        let sort = {};
        switch (q.sort) {
            case "newest": // newest = most recently created
                sort = { createdAt: -1 };
                break;
            case "latest": // latest = last updated
                sort = { updatedAt: -1 };
                break;
            case "asc": // price low → high
                sort = { price: 1 };
                break;
            case "desc": // price high → low
                sort = { price: -1 };
                break;
            default:
                sort = { createdAt: -1 }; // fallback: newest
        }

        try {
            const products = await Product.find(filters)
                .sort(sort)
                .populate("vendorId")
                .lean();

            return { products };
        } catch (error) {
            console.error("Error in searchProducts:", error);
            throw new BadRequestError("Invalid query parameters");
        }
    };

    static readProducts = async (req) => {
        const userId = req.userId;

        const {
            q,
            minPrice,
            maxPrice,
            mine,
            page = "1",
            limit = "30",
            sort, // "asc" | "desc" | undefined
        } = req.query;

        let user = null;
        if (mine === "true") {
            user = await User.findById(userId);
            if (!user) throw new AuthFailureError("You are not authenticated!");
        }

        // --- Build filter ---
        const filter = {};
        if (mine === "true") filter.vendor = user._id;

        if (q && typeof q === "string" && q.trim()) {
            filter.title = { $regex: q.trim(), $options: "i" };
        }

        // ✅ Price range
        const priceFilter = {};
        if (minPrice !== undefined && !isNaN(Number(minPrice))) {
            priceFilter.$gte = Number(minPrice);
        }
        if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
            priceFilter.$lte = Number(maxPrice);
        }
        if (Object.keys(priceFilter).length > 0) {
            filter.price = priceFilter;
        }

        // --- Pagination ---
        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.min(100, Math.max(1, Number(limit) || 12));
        const skipNum = (pageNum - 1) * limitNum;

        // --- Sorting ---
        let sortStage = {};
        if (sort === "asc") sortStage.price = 1;
        if (sort === "desc") sortStage.price = -1;

        // --- Query pipeline ---
        const pipeline = [{ $match: filter }];

        if (Object.keys(sortStage).length > 0) {
            pipeline.push({ $sort: sortStage });
        } else {
            // default: newest first
            pipeline.push({ $sort: { createdAt: -1 } });
        }

        pipeline.push(
            { $skip: skipNum },
            { $limit: limitNum },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    title: 1,
                    status: 1,
                    stock: 1,
                    price: 1,
                    images: 1,
                    description: 1,
                    vendorId: 1,
                    createdAt: 1,
                },
            }
        );

        const [items, total] = await Promise.all([
            Product.aggregate(pipeline),
            Product.countDocuments(filter),
        ]);

        return {
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
            products: items,
        };
    };

    static deleteProduct = async (req) => {
        const userId = req.userId;
        const { productId } = req.params;

        // 1. Check user, product
        const user = await User.findById(userId);
        if (!user) throw new AuthFailureError("You are not authenticated!");
        const product = await Product.findById(productId);
        if (!product) throw new NotFoundError("Product not found");
        if (product.vendorId.toString() !== String(userId))
            throw new AuthFailureError(
                "You are not allowed to delete this product"
            );

        // 2. Delete images
        const imgs = Array.isArray(product.images)
            ? product.images
            : product.images
            ? [product.images]
            : [];
        await Promise.allSettled(
            imgs.flatMap((u) => {
                const clean = String(u || "").split(/[?#]/)[0];
                const rel = clean.startsWith("/public/")
                    ? clean.replace(/^\/public\//, "").replace(/^\//, "")
                    : null;
                const base = path.basename(clean || "");
                const p1 = rel ? path.join(UPLOADS_DIR, rel) : null;
                const p2 = base ? path.join(PRODUCTS_DIR, base) : null;
                return [p1, p2]
                    .filter(Boolean)
                    .map((p) => fs.rm(p, { force: true }));
            })
        );

        // 3. Delete product
        await product.deleteOne();
        return { message: "Product deleted successfully" };
    };

    static updateProduct = async (req) => {
        const userId = req.userId;
        const { productId } = req.params;
        const { name, price, description } = req.body;
        const newImageFile = req.file;

        // 1. Check user, product
        const user = await User.findById(userId);
        if (!user) throw new AuthFailureError("You are not authenticated!");
        const product = await Product.findById(productId);
        if (!product) throw new NotFoundError("Product not found");
        if (String(product.vendorId) !== String(user._id))
            throw new AuthFailureError(
                "You are not allowed to modify this product"
            );

        // 2. Validate fields if provided
        if (name !== undefined && !validateName(String(name))) {
            throw new BadRequestError("Product name must be 10–20 characters.");
        }
        if (price !== undefined) {
            const parsedPrice =
                typeof price === "string" ? Number(price) : price;
            if (!validatePrice(parsedPrice))
                throw new BadRequestError("Price must be a positive number.");
            product.price = parsedPrice;
        }

        if (description !== undefined) {
            if (!validateDescription(String(description)))
                throw new BadRequestError(
                    "Description must be at most 500 characters."
                );
            product.description = description.trim();
        }

        // 3. Handle image replacement
        if (newImageFile) {
            const newUrl = filePublicUrl(newImageFile);
            await safeDeleteImage(product.images);
            product.images = newUrl;
        }

        // 4. Apply name last (to keep original if not provided)
        if (name !== undefined) product.name = name.trim();

        await product.save();

        // 5. Return
        return {
            message: "Product updated successfully",
            product,
        };
    };
}

export default ProductService;
