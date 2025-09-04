import crypto from "crypto";
import dotenv from 'dotenv'
dotenv.config()

const checksumKey = process.env.ALEPAY_CHECK_SUM_KEY; // Replace with your Alepay checksum key

class AlepayService {
    static generateSignature = async (params) => {
        // Filter out null values, replacing them with empty strings
        const normalizedParams = Object.fromEntries(
            Object.entries(params).map(([key, value]) => [key, value === null ? "" : value])
        );
    
        // Sort keys alphabetically
        const sortedKeys = Object.keys(normalizedParams).sort();
    
        // Generate raw signature string without encoding
        const rawSignature = sortedKeys
            .map((key) => `${key}=${normalizedParams[key]}`)
            .join("&");
    
        // Generate HMAC-SHA256 signature
        const signature = crypto
            .createHmac("sha256", checksumKey)
            .update(rawSignature)
            .digest("hex");
    
        return signature;
    };    

    static generatePaymentData = async (paymentDetails) => {
        const {
            tokenKey,
            orderCode,
            customMerchantId,
            amount,
            currency = "VND",
            orderDescription,
            totalItem,
            returnUrl,
            cancelUrl,
            buyerName,
            buyerEmail,
            buyerPhone,
            buyerAddress,
            buyerCity,
            buyerCountry,
            checkoutType = 4,
            installment = false,
            month = null,
            bankCode = null,
            paymentMethod = null,
            paymentHours = '0.4',
            promotionCode = null,
            allowDomestic = true,
            language = "vi",
            cashback = null,
        } = paymentDetails;

        const params = {
            tokenKey,
            orderCode,
            customMerchantId,
            amount,
            currency,
            orderDescription,
            totalItem,
            returnUrl,
            cancelUrl,
            buyerName,
            buyerEmail,
            buyerPhone,
            buyerAddress,
            buyerCity,
            buyerCountry,
            checkoutType,
            installment,
            month,
            bankCode,
            paymentMethod,
            paymentHours,
            promotionCode,
            allowDomestic,
            language,
            cashback,
        };
        const signature = await this.generateSignature(params);
        return {
            ...params,
            signature,
        };
    };
}

export default AlepayService;
