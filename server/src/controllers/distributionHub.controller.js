// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Gia Hy
// ID: S4053650

import DistributionHubService from "../services/distributionHub.service.js";
import { SuccessResponse } from "../core/success.response.js";

class DistributionHubController {
  createDistributionHub = async (req, res, next) => {
    return new SuccessResponse({
      message: "DistributionHub created successfully",
      metadata: await DistributionHubService.createDistributionHub(req),
    }).send(res);
  };

  readDistributionHub = async (req, res, next) => {
    return new SuccessResponse({
      message: "Read DistributionHub successfully",
      metadata: await DistributionHubService.readDistributionHub(req),
    }).send(res);
  };

  readDistributionHubs = async (req, res, next) => {
    return new SuccessResponse({
      message: "Read DistributionHubs successfully",
      metadata: await DistributionHubService.readDistributionHubs(req),
    }).send(res);
  };

  updateDistributionHub = async (req, res, next) => {
    return new SuccessResponse({
      message: "DistributionHub updated successfully",
      metadata: await DistributionHubService.updateDistributionHub(req),
    }).send(res);
  };

  deleteDistributionHub = async (req, res, next) => {
    return new SuccessResponse({
      message: "DistributionHub deleted successfully",
      metadata: await DistributionHubService.deleteDistributionHub(req),
    }).send(res);
  };
}

export default new DistributionHubController();
