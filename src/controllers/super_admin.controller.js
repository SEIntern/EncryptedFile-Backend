import Admin from "../models/admins.model.js";
import { sendResponse } from "../utils/sendResponse.js";
import { STATUS } from "../constant/statusCodes.js";

export const get_admin_with_pending_req = async (req, res, next) => {
    try {
        // Find all admins with the status 'pending' and exclude the password from the result
        const pendingAdmins = await Admin.find({ status: 'pending' }).select('-password');

        if (!pendingAdmins || pendingAdmins.length === 0) {
            return sendResponse(res, STATUS.OK, "No pending admin registrations found.", { admins: [] });
        }

        sendResponse(res, STATUS.OK, "Pending admins fetched successfully.", { admins: pendingAdmins });
    } catch (err) {
        next(err);
    }
};

export const handle_admin_request = async (req, res, next) => {
    try {
        const { action } = req.body;
        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            sendResponse(res, STATUS.NOT_FOUND, "Admin not found.");
        }

        if (action === "approved") {
            admin.status = "approved";
            await admin.save();
        } else if (action === "rejected") {
            await Admin.findByIdAndDelete(req.params.id);
        } else {
            return sendResponse(res, STATUS.BAD_REQUEST, "Invalid action. Use 'approve' or 'reject'.");
        }
        sendResponse(res, STATUS.OK, `Admin request ${action} successfully.`);
    } catch (err) {
        next(err);
    }
};

export const get_all_admin = async (req, res, next) => {
    try {
        const admins = await Admin.find({});
        sendResponse(res, STATUS.OK, "All admins fetched successfully.", { admins });
    } catch (err) {
        next(err);
    }
};