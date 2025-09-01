import OrderService from "../services/order.service.js";
import { SuccessResponse } from "../core/success.response.js";

class OrderController {
    readOrder = async (req, res, next) => {
        return new SuccessResponse({
            message: "Read order successfully",
            metadata: await OrderService.readOrder(req),
        }).send(res);
    };

    readOrdersByHub = async (req, res, next) => {
        return new SuccessResponse({
            message: "Read orders by hub successfully",
            metadata: await OrderService.readOrdersByHub(req),
        }).send(res);
    };

    assignOrderToHub = async (req, res, next) => {
        return new SuccessResponse({
            message: "Assign order to hub successfully",
            metadata: await OrderService.assignOrderToHub(req),
        }).send(res);
    };

    updateOrderStatus = async (req, res, next) => {
        return new SuccessResponse({
            message: "Update order status successfully",
            metadata: await OrderService.updateOrderStatus(req),
        }).send(res);
    };

    createOrder = async (req, res, next) => {
        return new SuccessResponse({
            message: "Update order status successfully",
            metadata: await OrderService.createOrder(req),
        }).send(res);
    };
}

export default new OrderController();
