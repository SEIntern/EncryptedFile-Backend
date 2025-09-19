import { sendResponse } from "../utils/sendResponse.js";
import { STATUS } from "../constant/statusCodes.js";
import User from "../models/users.model.js";

import File from "../models/files.model.js";

export const get_user_file = async (req, res, next) => {
    const userId = req.user.userId;
    console.log(userId);
    try {
        const files = await File.find({user_id: userId})
        sendResponse(res, STATUS.OK, "All User fetched successfully.", { files });
    } catch (err) {
        next(err);
    }
};



