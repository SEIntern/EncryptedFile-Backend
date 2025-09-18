import { sendResponse } from "../utils/sendResponse.js";
import { STATUS } from "../constant/statusCodes.js";
import User from "../models/users.model.js";



export const get_all_user = async (req, res, next) => {
    const managerID = req.user.userId;
    console.log(managerID);
    try {
        const users = await User.find({manager_id: managerID})
        sendResponse(res, STATUS.OK, "All User fetched successfully.", { users });
    } catch (err) {
        next(err);
    }
};

