import express from 'express'
import authRoute from './auth/index.js'
import userRoute from './user/index.js'

const router = express.Router()

//Check Permission
router.use('/v1/api/auth', authRoute)
router.use('/v1/api/user', userRoute)

export default router