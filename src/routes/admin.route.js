
import express from 'express';
import { 
    get_all_manager, 
    get_all_user, 
    get_user_file, 
    get_admin_plan 
} from '../controllers/admin.controller.js';

import {  
    ProtectRoute, 
    authorizeRoles 
} from '../middlewares/auth.middleware.js';




const adminRouter = express.Router();


adminRouter.use(ProtectRoute);
adminRouter.use(authorizeRoles("admin"));

adminRouter.get('/getusers', get_all_user);
adminRouter.get('/getmanagers', get_all_manager);
adminRouter.get('/user/:id', get_user_file);
adminRouter.get("/getplan",get_admin_plan)


export default adminRouter;
