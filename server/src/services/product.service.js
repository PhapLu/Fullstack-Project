import { AuthFailureError, BadRequestError, NotFoundError } from "../core/error.response.js"
import Product from "../models/product.model.js"
import User from "../models/user.model.js"
import path from "path";
import fs from "fs/promises"; // <- promise-based API
import { PRODUCTS_DIR, UPLOADS_DIR } from "../configs/multer.config.js";

const absFromUploadsUrl = (rawUrl) => {
    if (!rawUrl || /^https?:\/\//i.test(rawUrl)) return null;
    const clean = String(rawUrl).split("?")[0].split("#")[0];
    if (!clean.startsWith("/uploads/")) return null;
    const rel = clean.replace(/^\/uploads\//, "").replace(/^\//, "");
    return path.join(UPLOADS_DIR, rel);
};

export const productPublicUrlFor = (filename) => `/uploads/products/${filename}`;

class ProductService {
    //-------------------CRUD----------------------------------------------------
    static createProduct = async (req) => {
        const userId = req.userId;
        const files = req.files || [];
    
        // 1. Check vendor
        const vendor = await User.findById(userId);
        if (!vendor) throw new AuthFailureError("You are not authenticated!");
        if (vendor.role !== "vendor") throw new AuthFailureError("Only vendors can create products");
    
        // 2. Validate body
        const { title, description, price, stock, status = "active" } = req.body;
    
        if (!title?.trim()) throw new BadRequestError("Title is required");
        if (!description?.trim()) throw new BadRequestError("Description is required");
    
        const pPrice = Number(price);
        const pStock = Number(stock);
        if (!Number.isFinite(pPrice) || pPrice < 0)
        throw new BadRequestError("Price must be a non-negative number");
        if (!Number.isInteger(pStock) || pStock < 0)
        throw new BadRequestError("Stock must be a non-negative integer");
        if (!["active", "inactive"].includes(status))
        throw new BadRequestError("Invalid status");
    
        // 3. Upload images
        if (!files.length) throw new BadRequestError("At least one product image is required");
        const images = files.map((f) => productPublicUrlFor(f.filename || path.basename(f.path)));
    
        // 4) Create
        const product = await Product.create({
            vendorId: userId,
            title: title.trim(),
            description: description.trim(),
            price: pPrice,
            stock: pStock,
            images,
            status,
        });
    
        return {
            product
        };
    };

    static readProduct = async(req) => {
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product) throw new NotFoundError("Product not found")
        return {
            product: {
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.images,
                description: product.description,
                vendor: product.vendorId
            }
        }
    }

    static readProfileProducts = async(req) => {
        const vendorId = req.params.vendorId

        // 1. Check user, vendor
        const vendor = await User.findById(vendorId)
        if(!vendor || vendor.role !== "vendor") throw new NotFoundError('Vendor not found')

        // 2. Get products
        const products = await Product.find({ vendorId}).sort({ createdAt: -1 }).lean()
        
        return {
           products
        }
    }

    static readProducts = async(req) => {
        const userId = req.userId;

        const { q, minPrice, maxPrice, mine, page = "1", limit = "12" } = req.query;
        // If "mine" is requested, check user

        let user = null;
        if (mine === "true") {
            user = await User.findById(userId);
            if (!user) throw new AuthFailureError("You are not authenticated!");
            // if (user.role !== "vendor") throw new AuthFailureError("Only vendors can view their products");
        }
        // Build filter
        const filter = {};
        if (mine === "true") filter.vendor = user._id;

        if (q && typeof q === "string" && q.trim()) {
            filter.name = { $regex: q.trim(), $options: "i" };
        }
        const priceFilter = {};
        const min = minPrice != null ? Number(minPrice) : null;
        const max = maxPrice != null ? Number(maxPrice) : null;
        if (min != null && Number.isFinite(min)) priceFilter.$gte = min;
        if (max != null && Number.isFinite(max)) priceFilter.$lte = max;
        if (Object.keys(priceFilter).length) filter.price = priceFilter;

        // Pagination
        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.min(100, Math.max(1, Number(limit) || 12));
        const skip = (pageNum - 1) * limitNum;

        // Query
        const [items, total] = await Promise.all([
            Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
            Product.countDocuments(filter)
        ]);

        return {
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            },
            products: items.map(p => ({
                id: p._id,
                name: p.name,
                price: p.price,
                images: p.images,
                description: p.description,
                vendor: p.vendorId
            }))
        };
    }
      
    static deleteProduct = async (req) => {
        const userId = req.userId;
        const { productId } = req.params;

        // 1. Check user, product
        const user = await User.findById(userId);
        if (!user) throw new AuthFailureError("You are not authenticated!");
        const product = await Product.findById(productId);
        if (!product) throw new NotFoundError("Product not found");
        if (product.vendorId.toString() !== String(userId))
            throw new AuthFailureError("You are not allowed to delete this product");

        // 2. Delete images
        const imgs = Array.isArray(product.images) ? product.images : product.images ? [product.images] : [];
        await Promise.allSettled(
            imgs.flatMap((u) => {
                const clean = String(u || "").split(/[?#]/)[0];
                const rel = clean.startsWith("/uploads/") ? clean.replace(/^\/uploads\//, "").replace(/^\//, "") : null;
                const base = path.basename(clean || "");
                const p1 = rel ? path.join(UPLOADS_DIR, rel) : null;
                const p2 = base ? path.join(PRODUCTS_DIR, base) : null;
                return [p1, p2].filter(Boolean).map((p) => fs.rm(p, { force: true }));
            })
        );
        
        // 3. Delete product
        await product.deleteOne();
        return { message: "Product deleted successfully" };
    };
      
    static updateProduct = async(req) => {
        const userId = req.userId;
        const { productId } = req.params;
        const { name, price, description } = req.body;
        const newImageFile = req.file;

        // 1. Authn
        const user = await User.findById(userId);
        if (!user) throw new AuthFailureError("You are not authenticated!");

        // 2. Find product
        const product = await Product.findById(productId);
        if (!product) throw new NotFoundError("Product not found");

        // 3. Ownership check
        if (String(product.vendorId) !== String(user._id)) {
            throw new AuthFailureError("You are not allowed to modify this product");
        }

        // 4. Validate fields if provided
        if (name !== undefined && !validateName(String(name))) {
            throw new BadRequestError("Product name must be 10–20 characters.");
        }
        if (price !== undefined) {
            const parsedPrice = typeof price === "string" ? Number(price) : price;
            if (!validatePrice(parsedPrice)) throw new BadRequestError("Price must be a positive number.");
                product.price = parsedPrice;
        }

        if (description !== undefined) {
            if (!validateDescription(String(description))) throw new BadRequestError("Description must be at most 500 characters.");
                product.description = description.trim();
        }

        // 5. Handle image replacement
        if (newImageFile) {
            const newUrl = filePublicUrl(newImageFile);
            await safeDeleteImage(product.images);
            product.images = newUrl;
        }

        // 6. Apply name last (to keep original if not provided)
        if (name !== undefined) product.name = name.trim();

        await product.save();

        // 7. Return
        return {
        message: "Product updated successfully",
            product: {
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.images,
                description: product.description
            }
        };
    }
}

export default ProductService;
