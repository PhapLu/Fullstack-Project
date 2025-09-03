import mongoose from "mongoose";
const { Schema } = mongoose;

const DOCUMENT_NAME = "DeliveryInformation";
const COLLECTION_NAME = "DeliveryInformations";

const DeliveryInformationSchema = new Schema(
    {
        customerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        name: { type: String, required: true, trim: true },
        phoneNumber: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        isDefault: { type: Boolean, default: false },
    },
    { timestamps: true, collection: COLLECTION_NAME }
);

const DeliveryInformation = mongoose.model(DOCUMENT_NAME, DeliveryInformationSchema);
export default DeliveryInformation;