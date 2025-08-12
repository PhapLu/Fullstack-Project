import mongoose from "mongoose";
const { Schema } = mongoose;

const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "Users";

const CustomerProfileSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 5 },
        address: { type: String, required: true, trim: true, minlength: 5 },
    },
    { _id: false }
);

const VendorProfileSchema = new Schema(
    {
        businessName: { type: String, required: true, trim: true, minlength: 5 },
        businessAddress: { type: String, required: true, trim: true, minlength: 5 },
    },
    { _id: false }
);

const ShipperProfileSchema = new Schema(
    {
        assignedHub: { type: Schema.Types.ObjectId, ref: "DistributionHub", required: true },
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
        passwordHash: { type: String, required: true },
        role: {
            type: String,
            enum: ["customer", "vendor", "shipper", "admin"],
            required: true,
            default: "customer",
            index: true,
        },
        avatar: {
            type: String,
            required: true,
            default: "/uploads/pastal_system_default_avatar.png",
        },
        email: { type: String, trim: true, lowercase: true },
        fullName: { type: String, trim: true },
        bg: { type: String, default: "/uploads/pastal_system_default_background2.png" },
        phone: { type: String },
        address: { type: String, default: "" },
        country: { type: String, default: "Vietnam" },
        bio: { type: String, default: "", maxlength: [200, "Bio cannot exceed 200 characters"] },
        customerProfile: { type: CustomerProfileSchema, required: function () { return this.role === "customer"; } },
        vendorProfile: { type: VendorProfileSchema, required: function () { return this.role === "vendor"; } },
        shipperProfile: { type: ShipperProfileSchema, required: function () { return this.role === "shipper"; } },
        verificationExpiry: { type: Date },
    },
    { timestamps: true, collection: COLLECTION_NAME }
);

UserSchema.pre("save", function (next) {
    if (this.isNew || this.isModified("verificationExpiry")) {
        this.verificationExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }
    next();
});

UserSchema.index({ fullName: "text", email: "text", bio: "text" });

UserSchema.index(
    { "vendorProfile.businessName": 1 },
    { unique: true, partialFilterExpression: { role: "vendor", "vendorProfile.businessName": { $exists: true } } }
);

UserSchema.index(
    { "vendorProfile.businessAddress": 1 },
    { unique: true, partialFilterExpression: { role: "vendor", "vendorProfile.businessAddress": { $exists: true } } }
);

const User = mongoose.model(DOCUMENT_NAME, UserSchema);
export default User;
