import express from 'express';



import {  
    ProtectRoute,
    authorizeRoles
} from '../middlewares/auth.middleware.js';
import { 
    get_user_file
 } from '../controllers/user.controller.js';




const userRouter = express.Router();


userRouter.use(ProtectRoute);
userRouter.use(authorizeRoles("user"));

userRouter.get('/files', get_user_file);

export default userRouter;
