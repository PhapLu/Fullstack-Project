import express from 'express'
import authRoute from './auth/index.js'
import userRoute from './user/index.js'
import orderRoute from './order/order.route.js'; 

const router = express.Router()

//Check Permission
router.use('/v1/api/auth', authRoute)
router.use('/v1/api/user', userRoute)
router.use('/v1/api/orders', orderRoute);

export default router