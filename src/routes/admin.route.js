
import express from 'express';
import { get_all_manager, get_all_user } from '../controllers/admin.controller.js';

import {  ProtectRoute } from '../middlewares/auth.middleware.js';




const adminRouter = express.Router();


adminRouter.use(ProtectRoute);

adminRouter.get('/getusers', get_all_user);
adminRouter.get('/getmanagers', get_all_manager);
// adminRouter.put('/adminrequest/:id', handle_admin_request);


export default adminRouter;
