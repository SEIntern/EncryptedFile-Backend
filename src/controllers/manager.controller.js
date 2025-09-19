import { sendResponse } from "../utils/sendResponse.js";
import { STATUS } from "../constant/statusCodes.js";
import User from "../models/users.model.js";

import File from "../models/files.model.js";

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


export const get_all_pending_file_req = async (req, res, next) => { 
    const managerId = req.user.userId;
    try {
        const pendingFiles = await File.find({
            status: 'pending',
            manager_id: managerId
        });
        if (!pendingFiles || pendingFiles.length === 0) {
            return sendResponse(res, STATUS.OK, "No pending file requests found for this manager.", { files: [] });
        }
        sendResponse(res, STATUS.OK, "Pending file requests fetched successfully.", { files: pendingFiles });
    }
    catch (err) {
        next(err);
    }
};


export const handle_file_request = async (req, res, next) => {
    try {
        const { action } = req.body;
        const file = await File.findById(req.params.id);

        if (!file) {
            sendResponse(res, STATUS.NOT_FOUND, "File not found.");
        }

        if (action === "approved") {
            file.status = "approved";
            await file.save();
        } else if (action === "rejected") {
            await File.findByIdAndDelete(req.params.id);
        } else {
            return sendResponse(res, STATUS.BAD_REQUEST, "Invalid action. Use 'approve' or 'reject'.");
        }
        sendResponse(res, STATUS.OK, `File request ${action} successfully.`);
    } catch (err) {
        next(err);
    }
};