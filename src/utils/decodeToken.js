import AppError from "../utils/AppError.js";
import { STATUS } from "../constant/statusCodes.js";
import jwt from "jsonwebtoken";



export const protect = (req,) => async (req, res, next) => {
    try {
        const token = req.cookies.Admin_token
        if (!token) {
            return next(new AppError(`You are not logged in. Please login to get access`, STATUS.UNAUTHORIZED));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (err) {
        next(err);
    }
};