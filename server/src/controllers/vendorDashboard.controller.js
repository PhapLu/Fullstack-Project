// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Gia Hy
// ID: S4053650

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
