import mongoose from "mongoose"
const Schema = mongoose.Schema

const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = "Users"

const UserSchema = new Schema(
    {
        fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, unique: true },
        password: { type: String, default: '' },
        role: {
            type: String,
            enum: ["member", "talent", "admin"],
            default: "member",
        },
        avatar: {
            type: String,
            default: "/uploads/pastal_system_default_avatar.png",
        },
        bg: {
            type: String,
            default: "/uploads/pastal_system_default_background2.png",
        },
        phone: { type: String },
        address: { type: String, default: "" },
        country: { type: String, default: "Vietnam" },
        bio: {
            type: String,
            default: "",
            maxlength: [200, "Bio cannot exceed 200 characters"],
        },
    }, {
    timestamps: true,
    collection: COLLECTION_NAME,
})

// Middleware to set the verificationExpiry field to 30 minutes in the future
UserSchema.pre("save", function (next) {
    if (this.isNew || this.isModified("verificationExpiry")) {
        this.verificationExpiry = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    }
    next()
})

// Indexing for searching
UserSchema.index({ fullName: 'text', stageName: 'text', email: 'text', bio: 'text' })
UserSchema.index({ domainName: 1 })

const User = mongoose.model(DOCUMENT_NAME, UserSchema)
export default User
