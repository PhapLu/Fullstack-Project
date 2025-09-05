import { AuthFailureError, BadRequestError, NotFoundError } from "../core/error.response.js"
import DistributionHub from "../models/distributionHub.model.js"
import Order from "../models/order.model.js";
import User from "../models/user.model.js";

class DistributionHubService {
    //-------------------CRUD----------------------------------------------------
    static createDistributionHub = async(req) => {
        const { name, address } = req.body;
        const adminId = req.userId

        // 1. Validate inputs
        if (!name || !address)
            throw new BadRequestError('All fields are required')

        // 2. Verify admin
        const admin = await User.findById(adminId)
        // if (!admin || admin.role !== 'admin') 
        //     throw new AuthFailureError('You are not authorized to create a DistributionHub')

        // 3. Check if DistributionHub already exists
        const existingDistributionHub = await DistributionHub.findOne({name})
        if (existingDistributionHub)
            throw new BadRequestError('DistributionHub with this name already exists')

        // 4. Create new DistributionHub
        const newDistributionHub = new DistributionHub({
            name,
            address,
        });

        await newDistributionHub.save();
        return {
            distributionHub: newDistributionHub
        }
    }

    static readDistributionHub = async(req) => {
        const distributionHubId = req.params.distributionHubId
        const shipperId = req.userId

        // 1. Check distributionHub and shipper
        const shipper = await User.findById(shipperId)
        if (!shipper || shipper.role !== 'shipper') 
            throw new AuthFailureError('You are not authorized to view DistributionHub details')
        if (shipper.shipperProfile.assignedHub.toString() !== distributionHubId)
            throw new AuthFailureError('You are not assigned to this DistributionHub')

        const distributionHub = await DistributionHub.findById(distributionHubId).lean()
        if (!distributionHub) throw new NotFoundError('DistributionHub not found')

        // 2. Return distributionHub orders
        // const orders = await Order.find({ distributionHubId })
        //     .populate('customerId', 'fullName avatar')
        //     .populate('distributionHubId', 'name address')
        //     .sort({ placedAt: -1 });
        // distributionHub.orders = orders;
        // distributionHub.ordersCount = orders.length;

        // console.log(distributionHub)

        // 3. Return distributionHub data
        return{
            distributionHub,
        }
    }

    static readDistributionHubs = async(req) => {
        // 1. Get all distributionHubs
        const distributionHubs = await DistributionHub.find()

        // 2. Return distributionHubs data
        return {
            distributionHubs,
        }
    }

    static updateDistributionHub = async(req) => {
        const adminId = req.userId
        const distributionHubId = req.params.distributionHubId

        // 1. Check admin and distributionHub
        const admin = await User.findById(adminId)
        if (!admin || admin.role !== 'admin') 
            throw new AuthFailureError('You are not authorized to update a DistributionHub')
        const distributionHub = await DistributionHub.findById(distributionHubId)
        if (!distributionHub) throw new NotFoundError('DistributionHub not found')

        //2. Validate inputs
        const { name, address } = req.body;
        if (!name || !address) {
            throw new BadRequestError('All fields are required')
        }

        // 3. Update distributionHub
        distributionHub.name = name;
        distributionHub.address = address;
        await distributionHub.save();

        return {
            message: 'DistributionHub updated successfully',
        }
    }

    static deleteDistributionHub = async(req) => {
        const adminId = req.userId
        const distributionHubId = req.params.distributionHubId

        // 1. Check admin and distributionHub
        const admin = await User.findById(adminId)
        if (!admin || admin.role !== 'admin') 
            throw new AuthFailureError('You are not authorized to delete a DistributionHub')
        const distributionHub = await DistributionHub.findById(distributionHubId)
        if (!distributionHub) throw new NotFoundError('DistributionHub not found')

        // 2. Delete distributionHub
        await distributionHub.deleteOne();

        // 3. Remove distributionHub reference from all shippers
        await User.updateMany(
            { assignedHub: distributionHubId },
            { $unset: { assignedHub: "" } }
        );

        // 4. Remove distributionHub reference from all orders
        await Order.updateMany(
            { distributionHubId },
            { $unset: { distributionHubId: "" } }
        );
        return {
            message: 'DistributionHub deleted successfully',
        }
    }
}

export default DistributionHubService;
