import VendorDashboardService from "../services/vendorDashboard.service.js";
import { SuccessResponse } from "../core/success.response.js";

class VendorDashboardController {
    readVendorOrders = async (req, res, next) => {
        return new SuccessResponse({
            message: "Read vendor orders successfully",
            metadata: await VendorDashboardService.readVendorOrders(req),
        }).send(res);
    };
}

export default new VendorDashboardController();
