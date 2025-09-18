
import express from 'express';
import { 
    super_admin_login ,
    Super_admin_create_admin,
    adminSignup, 
    adminLogin,
    admin_create_manager, 
    managerLogin, 
    manager_create_user, 
    userLogin
} from '../controllers/auth.controller.js';

import {  ProtectRoute } from '../middlewares/auth.middleware.js';


const AuthRouter = express.Router();

// user route
AuthRouter.post('/userlogin', userLogin);


// manager route 
AuthRouter.post('/managerlogin', managerLogin);
AuthRouter.post('/createuser', ProtectRoute, manager_create_user); 

// admin route
AuthRouter.post('/adminlogin', adminLogin);
AuthRouter.post('/adminsignup', adminSignup);
AuthRouter.post('/createmanager', ProtectRoute, admin_create_manager); 


// super admin route
AuthRouter.post('/superadminlogin', super_admin_login);
AuthRouter.post('/createadmin', ProtectRoute, Super_admin_create_admin);


export default AuthRouter;
