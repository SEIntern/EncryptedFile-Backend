
import express from 'express';
import authRoutes from './routes/auth.route.js';
import { errorHandler } from './middlewares/error.middleware.js';
import cookieParser from "cookie-parser";
import super_admin_router from './routes/super_admin.route.js';
import adminRouter from './routes/admin.route.js';
import managerRouter from './routes/manager.route.js';

const app = express();

app.use(express.json());
app.use(cookieParser());


app.use('/api/auth', authRoutes);
app.use('/api/superadmin', super_admin_router);
app.use('/api/admin', adminRouter);
app.use('/api/manager', managerRouter);



app.use(errorHandler);
export default app;
