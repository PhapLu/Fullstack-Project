import { AuthFailureError, BadRequestError, NotFoundError } from "../core/error.response.js"
import DeliveryInformation from "../models/deliveryInformation.model.js"
import Order from "../models/order.model.js";
import User from "../models/user.model.js";

class DeliveryInformationService {
    //-------------------CRUD----------------------------------------------------
    static createDeliveryInformation = async(req) => {
        let { name, address, phoneNumber, isDefault, distributionHubId } = req.body;
        const userId = req.userId

        // 1. Validate inputs
        if (!name || !address || !phoneNumber)
            throw new BadRequestError('All fields are required')
        // 2. Verify user
        const user = await User.findById(userId)
        if(!user) throw new NotFoundError('User not found')

        // 3. Handle default deliveryInformation
        const existingDefault = await DeliveryInformation.findOne({ customerId: userId, isDefault: true });
        if(!isDefault){
            // If no default exists, set this as default
            if (!existingDefault) {
                isDefault = true;
            }
        } else {
            // If setting new default, unset existing default
            if (existingDefault) {
                existingDefault.isDefault = false;
                await existingDefault.save();
            }
        }

        // 4. Create new DeliveryInformation
        const newDeliveryInformation = new DeliveryInformation({
            customerId: userId,
            name,
            address,
            phoneNumber,
            isDefault,
            distributionHubId
        });

        await newDeliveryInformation.save();
        return {
            message: 'DeliveryInformation created successfully',
        }
    }

    static readDeliveryInformation = async(req) => {
        const deliveryInformationId = req.params.deliveryInformationId
        const shipperId = req.userId

        // 1. Check deliveryInformation and shipper
        const shipper = await User.findById(shipperId)
        if (!shipper || shipper.role !== 'shipper') 
            throw new AuthFailureError('You are not authorized to view DeliveryInformation details')
        if (shipper.shipperProfile.assignedHub.toString() !== deliveryInformationId)
            throw new AuthFailureError('You are not assigned to this DeliveryInformation')

        const deliveryInformation = await DeliveryInformation.findById(deliveryInformationId).lean()
        if (!deliveryInformation) throw new NotFoundError('DeliveryInformation not found')

        // 2. Return deliveryInformation orders
        const orders = await Order.find({ deliveryInformationId })
            .populate('customerId', 'fullName avatar')
            .populate('vendorId', 'fullName avatar')
            .populate('shipperId', 'fullName avatar')
            .sort({ placedAt: -1 });
        deliveryInformation.orders = orders;
        deliveryInformation.ordersCount = orders.length;

        // 3. Return deliveryInformation data
        return{
            deliveryInformation,
        }
    }

    static readDeliveryInformations = async(req) => {
        // 1. Get all deliveryInformations
        const deliveryInformations = await DeliveryInformation.find({customerId: req.userId}).lean()

        return {
            deliveryInformations,
        }
    }

    static deleteDeliveryInformation = async(req) => {
        const userId = req.userId
        const deliveryInformationId = req.params.deliveryInformationId

        // 1. Check user and deliveryInformation
        const user = await User.findById(userId)
        if(!user) throw new NotFoundError('User not found')
        const deliveryInformation = await DeliveryInformation.findById(deliveryInformationId)
        if (!deliveryInformation) throw new NotFoundError('DeliveryInformation not found')

        // 2. Delete deliveryInformation
        await deliveryInformation.deleteOne();
        return {
            message: 'DeliveryInformation deleted successfully',
        }
    }
}

export default DeliveryInformationService;
