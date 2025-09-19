
import express from 'express';
import { get_all_manager, get_all_user, get_user_file } from '../controllers/admin.controller.js';

import {  ProtectRoute } from '../middlewares/auth.middleware.js';




const adminRouter = express.Router();


adminRouter.use(ProtectRoute);

adminRouter.get('/getusers', get_all_user);
adminRouter.get('/getmanagers', get_all_manager);
adminRouter.get('/user/:id', get_user_file);


export default adminRouter;
