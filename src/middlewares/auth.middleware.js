import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/sendResponse.js";
import { STATUS } from "../constant/statusCodes.js";


export const ProtectRoute =(req,res,next)=>{
 const token=req.cookies.AuthToken;
    if(!token){
        return res.status(401).json({message:"You are not logged in. Please login to get access"});
    }
    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next();
    } catch (error) {
        next(error);
    }
}


export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return sendResponse(res, STATUS.FORBIDDEN, "Access denied");
    }
    next();
  };
};
