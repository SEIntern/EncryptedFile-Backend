import express from 'express'
import { ProtectRoute } from '../middlewares/auth.middleware.js';
import { 
    get_all_plan,
    createSubscription,
    verifySubscription
} from '../controllers/subscription.controller.js';


const planRouter = express.Router();


planRouter.use(ProtectRoute)

planRouter.get('/getplans', get_all_plan);
planRouter.post('/subscribe', createSubscription);
planRouter.post('/verify', verifySubscription);


export default planRouter;