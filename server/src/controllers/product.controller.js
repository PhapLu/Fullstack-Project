import ProductService from '../services/product.service.js'
import { SuccessResponse } from "../core/success.response.js"

class ProductController {
    createProduct = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Create product successfully',
            metadata: await ProductService.createProduct(req)
        }).send(res)
    }

    readProduct = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Read product successfully',
            metadata: await ProductService.readProduct(req)
        }).send(res)
    }

    readProfileProducts = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Read profile products successfully',
            metadata: await ProductService.readProfileProducts(req)
        }).send(res)
    }

    readProducts = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Read products successfully',
            metadata: await ProductService.readProducts(req)
        }).send(res)
    }

    updateProduct = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Update product successfully',
            metadata: await ProductService.updateProduct(req)
        }).send(res)
    }
    
    deleteProduct = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Delete product successfully',
            metadata: await ProductService.deleteProduct(req)
        }).send(res)
    }

    searchProducts = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Search products successfully',
            metadata: await ProductService.searchProducts(req)
        }).send(res)
    }
}

export default new ProductController()