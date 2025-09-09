// controllers/adminDashboard.controller.js
import { SuccessResponse } from "../core/success.response.js";
import AdminDashboardService from "../services/adminDashboard.service.js";

class AdminDashboardController {
  readOverview = async (req, res) => {
    return new SuccessResponse({
      message: "read Overview successfully",
      metadata: await AdminDashboardService.readOverview(req),
    }).send(res);
  };

  readHubs = async (req, res) => {
    return new SuccessResponse({
      message: "Read Hubs successfully",
      metadata: await AdminDashboardService.readHubs(req),
    }).send(res);
  };

  updateHub = async (req, res) => {
    return new SuccessResponse({
      message: "Update Hub successfully",
      metadata: await AdminDashboardService.updateHub(req),
    }).send(res);
  };

  deleteHub = async (req, res) => {
    return new SuccessResponse({
      message: "Delete Hub successfully",
      metadata: await AdminDashboardService.deleteHub(req),
    }).send(res);
  };
}

export default new AdminDashboardController();
