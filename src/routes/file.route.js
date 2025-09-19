
import express from 'express';
import { uploadFile, upload, downloadFile } from '../controllers/file.controller.js';
import {  ProtectRoute } from '../middlewares/auth.middleware.js';



const fileRouter = express.Router();


fileRouter.use(ProtectRoute);

fileRouter.post('/upload', upload.single('file'), uploadFile);
fileRouter.get("/download/:id", downloadFile);
// fileRouter.get('/getmanagers', get_all_manager);


export default fileRouter;
