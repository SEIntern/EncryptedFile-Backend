import express from 'express';

import { 
    get_all_user, 
    get_all_pending_file_req,
    handle_file_request,
    get_user_file
} from '../controllers/manager.controller.js';

import {  
    ProtectRoute,
    authorizeRoles
 } from '../middlewares/auth.middleware.js';




const managerRouter = express.Router();


managerRouter.use(ProtectRoute);
managerRouter.use(authorizeRoles("manager"));

managerRouter.get('/getusers', get_all_user);
managerRouter.get('/pendingrequests', get_all_pending_file_req);
managerRouter.put('/filerequest/:id', handle_file_request);
managerRouter.get('/user/:id', get_user_file);

export default managerRouter;
