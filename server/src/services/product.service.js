import { AuthFailureError, BadRequestError, NotFoundError } from "../core/error.response.js"
import Product from "../models/product.model.js"
import User from "../models/user.model.js"
import path from "path";
import fs from "fs/promises";

const UPLOADS_DIR = path.join(process.cwd(), "src", "uploads");

class ProductService {
    //-------------------CRUD----------------------------------------------------
    static createProduct = async (req) => {
        const userId = req.userId
        const { name, price, description } = req.body;
        const imageFile = req.file;

        // 1. Check user
        const user = await User.findById(userId)
        if(!user) throw new AuthFailureError('You are not authenticated!')

        // 2. Validate body
        if (!validateName(name)) throw new BadRequestError("Product name must be 10–20 characters.");
        const parsedPrice = typeof price === "string" ? Number(price) : price;
        if (!validatePrice(parsedPrice)) throw new BadRequestError("Price must be a positive number.");
        if (!validateDescription(description ?? "")) throw new BadRequestError("Description must be at most 500 characters.");
        if (!imageFile) throw new BadRequestError("Product image is required.");

        // 3. Create Product
        const product = await Product.create({
            name: name.trim(),
            price: parsedPrice,
            description: (description ?? "").trim(),
            image: filePublicUrl(imageFile),
            vendor: user._id
        })

        return {
            message: "Product created successfully"
        }
    }

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
                image: p.images,
                description: p.description,
                vendor: p.vendorId
            }))
        };
    }

    static deleteProduct = async(req) => {
        const userId = req.userId;
        const { productId } = req.params;

        // 1. Authentication
        const user = await User.findById(userId);
        if (!user) throw new AuthFailureError("You are not authenticated!");

        // 2. Find product
        const product = await Product.findById(productId);
        if (!product) throw new NotFoundError("Product not found")

        // 3. Ownership check
        if (String(product.vendorId) !== String(user._id)) {
            throw new AuthFailureError("You are not allowed to delete this product");
        }

        // 4. Delete image (best-effort)
        await safeDeleteImage(product.images);

        // 5. Delete doc
        await Product.deleteOne({ _id: productId });

        // 6. Return
        return { message: "Product deleted successfully" };
    }

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
