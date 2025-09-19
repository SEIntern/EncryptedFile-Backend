import express from 'express';



import {  ProtectRoute } from '../middlewares/auth.middleware.js';
import { 
    get_user_file
 } from '../controllers/user.controller.js';




const userRouter = express.Router();


userRouter.use(ProtectRoute);

userRouter.get('/files', get_user_file);

export default userRouter;
