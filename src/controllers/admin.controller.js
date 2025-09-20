import { sendResponse } from "../utils/sendResponse.js";
import { STATUS } from "../constant/statusCodes.js";
import User from "../models/users.model.js";
import Manager from "../models/managers.model.js";
import File from "../models/files.model.js";
import Admin from "../models/admins.model.js";
import SubscriptionPlan from "../models/subscription_plans.model.js";



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

export const get_user_file = async (req, res, next) => {
    const userId = req.params.id;
    console.log(userId);
    try {
        const files = await File.find({ user_id: userId });
        if (!files || files.length === 0) {
            return sendResponse(res, STATUS.OK, "No files found for this user.", { files: [] });
        }
        sendResponse(res, STATUS.OK, "File fetched successfully.", { files });
    } catch (err) {
        next(err);
    }
};

export const get_admin_plan = async (req, res, next) => {
    const adminId = req.user.userId;
    try {
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return sendResponse(res, STATUS.NOT_FOUND, "Admin not found.");
        }  
        const subscriptionPlan = admin.subscription.plan_id;
        const plan = await SubscriptionPlan.findById(subscriptionPlan);
        if (!subscriptionPlan) {
            return sendResponse(res, STATUS.NOT_FOUND, "Subscription plan not found for this admin.");
        }
        sendResponse(res, STATUS.OK, "Subscription plan fetched successfully.", { plan });
    } catch (err) {
        next(err);
    }
};

