import express from 'express'
import { getRoles } from '../controllers/rol.controller'
import { checkAuth } from '../middlewares/auth.middleware'

export const rolRoutes = express.Router()
rolRoutes.get("/", checkAuth, getRoles)