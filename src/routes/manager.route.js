
import express from 'express';
import { get_all_user } from '../controllers/manager.controller.js';
import {  ProtectRoute } from '../middlewares/auth.middleware.js';




const managerRouter = express.Router();


managerRouter.use(ProtectRoute);

managerRouter.get('/getusers', get_all_user);


export default managerRouter;
