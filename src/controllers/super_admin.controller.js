import Admin from "../models/admins.model.js";
import { sendResponse } from "../utils/sendResponse.js";
import { STATUS } from "../constant/statusCodes.js";
import SubscriptionPlan from "../models/subscription_plans.model.js";

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
            return sendResponse(res, STATUS.NOT_FOUND, "Admin not found.");
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


export const create_subscription_plan = async (req, res, next) => {
    try {
        const {plan_name, duration_days, max_managers, max_users_per_manager, max_files_per_user, price} = req.body;
        const subscriptionPlan = new SubscriptionPlan
        ({
            plan_name,
            duration_days,
            max_managers,
            max_users_per_manager,
            max_files_per_user,
            price
        });
        await subscriptionPlan.save();
        sendResponse(res, STATUS.OK, "Subscription plan created successfully.", {});
    } catch (err) {
        next(err);
    }
};