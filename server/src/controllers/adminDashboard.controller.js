import { SuccessResponse } from "../core/success.response.js"
import AdminDashboardService from "../services/adminDashboard.service.js"

class AdminDashboardController {
        readOverview = async(req, res, next) => {
                return new SuccessResponse ({
                        message: 'read Overview successfully',
                        metadata: await AdminDashboardService.readOverview(req)
                }).send(res)
        }

        readHubs =  async(req, res, next) => {
                return new SuccessResponse ({
                        message: 'Read Hubs successfully',
                        metadata: await AdminDashboardService.readHubs(req)
                }).send(res)
        }

        
}

export default new AdminDashboardController()