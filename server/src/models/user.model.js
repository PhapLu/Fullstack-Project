import mongoose from "mongoose";
const { Schema } = mongoose;

const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "Users";

const CustomerProfileSchema = new Schema(
    {
        name: { type: String, trim: true },
        address: { type: String, trim: true },
    },
    { _id: false }
);

const VendorProfileSchema = new Schema(
    {
        businessName: { type: String, required: true, trim: true },
        businessAddress: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const ShipperProfileSchema = new Schema(
    {
        assignedHub: {
            type: Schema.Types.ObjectId,
            ref: "DistributionHub",
            required: true,
        },
    },
    { _id: false }
);

const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ["customer", "vendor", "shipper", "admin"],
            required: true,
            index: true,
        },
        avatar: {
            type: String,
            required: true,
            default: "/uploads/avatars/default-avatar.png",
        },
        email: { type: String, trim: true, lowercase: true },
        phone: { type: String },
        country: { type: String, default: "Vietnam" },
        bio: {
            type: String,
            default: "",
            maxlength: [200, "Bio cannot exceed 200 characters"],
        },
        customerProfile: {
            type: CustomerProfileSchema,
            required: function () {
                return this.role === "customer";
            },
        },
        vendorProfile: {
            type: VendorProfileSchema,
            required: function () {
                return this.role === "vendor";
            },
        },
        shipperProfile: {
            type: ShipperProfileSchema,
            required: function () {
                return this.role === "shipper";
            },
        },
    },
    { timestamps: true, collection: COLLECTION_NAME }
);

UserSchema.index({
    "customerProfile.name": "text",
    email: "text",
    bio: "text",
});

UserSchema.index(
    { "vendorProfile.businessName": 1 },
    {
        unique: true,
        partialFilterExpression: {
            role: "vendor",
            "vendorProfile.businessName": { $type: "string" },
        },
        collation: { locale: "en", strength: 2 }, // optional but recommended
    }
);

// 4) Vendor-only unique businessAddress (partial unique + case-insensitive)
UserSchema.index(
    { "vendorProfile.businessAddress": 1 },
    {
        unique: true,
        partialFilterExpression: {
            role: "vendor",
            "vendorProfile.businessAddress": { $type: "string" },
        },
        collation: { locale: "en", strength: 2 }, // optional but recommended
    }
);

const User = mongoose.model(DOCUMENT_NAME, UserSchema);
export default User;
