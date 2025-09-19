
import express from 'express';
import { 
    get_admin_with_pending_req, 
    handle_admin_request, 
    get_all_admin,
    create_subscription_plan
} from '../controllers/super_admin.controller.js';

import {  ProtectRoute } from '../middlewares/auth.middleware.js';




const super_admin_router = express.Router();


super_admin_router.use(ProtectRoute);

super_admin_router.get('/pendingadmins', get_admin_with_pending_req);
super_admin_router.get('/getadmins', get_all_admin);
super_admin_router.put('/adminrequest/:id', handle_admin_request);
super_admin_router.post('/createplan',create_subscription_plan)

export default super_admin_router;
