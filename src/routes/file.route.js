
import express from 'express';
import { uploadFile, upload, downloadFile, deleteFile } from '../controllers/file.controller.js';
import {  ProtectRoute } from '../middlewares/auth.middleware.js';



const fileRouter = express.Router();


fileRouter.use(ProtectRoute);

fileRouter.post('/upload', upload.single('file'), uploadFile);
fileRouter.get("/download/:id", downloadFile);
fileRouter.delete("/delete/:id", deleteFile);


export default fileRouter;
