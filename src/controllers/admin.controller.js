import { sendResponse } from "../utils/sendResponse.js";
import { STATUS } from "../constant/statusCodes.js";
import User from "../models/users.model.js";
import Manager from "../models/managers.model.js";



export const get_all_user = async (req, res, next) => {
    const adminID = req.user.userId;
    console.log(adminID);
    try {
        const users = await User.find({admin_id: adminID})
        sendResponse(res, STATUS.OK, "All User fetched successfully.", { users });
    } catch (err) {
        next(err);
    }
};

export const get_all_manager = async (req, res, next) => {
    const adminID = req.user.userId;
    console.log(adminID);
    try {
        const manager = await Manager.find({admin_id: adminID})
        sendResponse(res, STATUS.OK, "All managers fetched successfully.", { manager });
    } catch (err) {
        next(err);
    }
};