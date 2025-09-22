
import express from 'express';
import {
    Super_admin_create_admin,
    adminSignup,
    admin_create_manager,
    manager_create_user,
    login,
    getMe
} from '../controllers/auth.controller.js';

import { 
    ProtectRoute,
authorizeRoles
} from '../middlewares/auth.middleware.js';


const AuthRouter = express.Router();

// login
AuthRouter.post('/login', login);

//me route
AuthRouter.get('/me', ProtectRoute, getMe);

// manager route 
AuthRouter.post('/createuser', ProtectRoute, authorizeRoles("manager"), manager_create_user);

// admin route
AuthRouter.post('/adminsignup', adminSignup);
AuthRouter.post('/createmanager', ProtectRoute, authorizeRoles("admin"), admin_create_manager);

// super admin route
AuthRouter.post('/createadmin', ProtectRoute, authorizeRoles("super_admin"), Super_admin_create_admin);


export default AuthRouter;
