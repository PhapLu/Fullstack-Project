import express from 'express'
import authRoute from './auth/index.js'
import userRoute from './user/index.js'
import reviewRoute from './review/index.js'

const router = express.Router()

//Check Permission
router.use('/v1/api/auth', authRoute)
router.use('/v1/api/user', userRoute)
router.use('/v1/api/reviews', reviewRoute)

export default router