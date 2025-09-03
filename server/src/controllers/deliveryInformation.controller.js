import DeliveryInformationService from '../services/deliveryInformation.service.js'
import { SuccessResponse } from "../core/success.response.js"

class DeliveryInformationController {
    createDeliveryInformation = async (req, res, next) => {
        return new SuccessResponse({
            message: 'DeliveryInformation created successfully',
            metadata: await DeliveryInformationService.createDeliveryInformation(req)
        }).send(res)
    }

    readDeliveryInformation = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Read DeliveryInformation successfully',
            metadata: await DeliveryInformationService.readDeliveryInformation(req)
        }).send(res)
    }

    readDeliveryInformations = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Read DeliveryInformations successfully',
            metadata: await DeliveryInformationService.readDeliveryInformations(req)
        }).send(res)
    }

    deleteDeliveryInformation = async (req, res, next) => {
        return new SuccessResponse({
            message: 'DeliveryInformation deleted successfully',
            metadata: await DeliveryInformationService.deleteDeliveryInformation(req)
        }).send(res)
    }
}

export default new DeliveryInformationController()