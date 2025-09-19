import Razorpay from "razorpay";
import crypto from "crypto";
import { sendResponse } from "../utils/sendResponse.js";
import { STATUS } from "../constant/statusCodes.js";
import subscription_plansModel from "../models/subscription_plans.model.js";
import Admin from "../models/admins.model.js";
import AppError from "../utils/AppError.js";
import dotenv from "dotenv";
dotenv.config();


export const get_all_plan = async (req, res, next) => {
    try {
        const plan = await subscription_plansModel.find();
        sendResponse(res, STATUS.OK, "All Plan fetched successfully.", { plan });
    } catch (err) {
        next(err);
    }
};

export const createSubscription = async (req, res, next) => {
    try {
        const { plan_id } = req.body;
        const adminId = req.user.userId;

        const plan = await subscription_plansModel.findById(plan_id);
        if (!plan) {
            return next(new AppError("Plan not found", STATUS.NOT_FOUND));
        }

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return next(new AppError("Admin not found", STATUS.NOT_FOUND));
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: plan.price * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_order_${new Date().getTime()}`,
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return next(new AppError("Failed to create order", STATUS.INTERNAL_SERVER_ERROR));
        }

        // Save order details to the admin
        admin.subscription.plan_id = plan_id;
        admin.subscription.razorpay_order_id = order.id;
        await admin.save();

        sendResponse(res, STATUS.OK, "Subscription order created successfully.", { order });

    } catch (err) {
        next(err);
    }
};

export const verifySubscription = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const admin = await Admin.findOne({ "subscription.razorpay_order_id": razorpay_order_id });
        if (!admin) {
            return next(new AppError("Order not found for any admin.", STATUS.NOT_FOUND));
        }

        const plan = await subscription_plansModel.findById(admin.subscription.plan_id);
        if (!plan) {
            return next(new AppError("Plan not found for this order.", STATUS.NOT_FOUND));
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return next(new AppError("Payment verification failed. Invalid signature.", STATUS.BAD_REQUEST));
        }

        // Payment is verified, update subscription details
        admin.subscription.razorpay_payment_id = razorpay_payment_id;
        admin.subscription.razorpay_signature = razorpay_signature;
        admin.subscription.is_active = true;
        admin.subscription.start_date = new Date();
        admin.subscription.end_date = new Date(new Date().setDate(new Date().getDate() + plan.duration_days));
        await admin.save();

        sendResponse(res, STATUS.OK, "Subscription verified successfully.");
    } catch (err) {
        next(err);
    }
};
