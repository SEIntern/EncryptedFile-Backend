import bcrypt from "bcrypt";
import User from "../models/users.model.js";
import Admin from "../models/admins.model.js";
import Manager from "../models/managers.model.js";
import SuperAdmin from "../models/super_admin.model.js";
import jwt from "jsonwebtoken"
import { generatetoken } from "../utils/generateToken.js";
import AppError from "../utils/AppError.js";
import { sendResponse } from "../utils/sendResponse.js";
import { STATUS } from "../constant/statusCodes.js";





// user controllers
export const userLogin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email })

        if (!user) return next(new AppError("Invalid credentials", STATUS.BAD_REQUEST));

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return next(new AppError("Invalid credentials", STATUS.BAD_REQUEST));

        const token = generatetoken(user._id);

        res.cookie("AuthToken", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });

        sendResponse(res, STATUS.OK, "User logged in successfully.", { user });
    } catch (err) {
        next(err);
    }
}


// manager controllers
export const managerLogin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        let manager = await Manager.findOne({ email })

        if (!manager) return next(new AppError("Invalid credentials", STATUS.BAD_REQUEST));

        const isMatch = await bcrypt.compare(password, manager.password);
        if (!isMatch) return next(new AppError("Invalid credentials", STATUS.BAD_REQUEST));

        const token = generatetoken(manager._id);

        res.cookie("AuthToken", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });

        sendResponse(res, STATUS.OK, "Manager logged in successfully.", { manager });
    } catch (err) {
        next(err);
    }
}
export const manager_create_user = async (req, res, next) => {
    const managerId = req.user.userId;
    console.log(managerId);
    const manager = await Manager.findById(managerId);
    if (!manager) {
        return next(new AppError("Manager not found.", STATUS.UNAUTHORIZED));
    }

    const adminId = manager.admin_id;
    console.log(managerId);

    const { username, email, password, max_files } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendResponse(res, STATUS.BAD_REQUEST, "User with this email already exists.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            created_by: managerId,
            manager_id: managerId,
            admin_id: adminId,
            max_files,
        });

        await newUser.save();

        return sendResponse(res, STATUS.CREATED, "User created successfully.", { user: newUser });
    } catch (err) {
        next(err);
    }
};




// admin controllers
export const adminSignup = async (req, res, next) => {
    const { company_name, email, password } = req.body;
    //   console.log(req.body);
    try {
        const existing = await Admin.findOne({ email });
        if (existing)
            sendResponse(res, STATUS.BAD_REQUEST, "Admin with this email already exists.");

        const hashed = await bcrypt.hash(password, 10);

        const admin = new Admin({
            company_name,
            email,
            password: hashed,
            status: "pending",
        });

        await admin.save();

        sendResponse(res, STATUS.CREATED, "Admin registered successfully. Awaiting approval.", { admin });
    } catch (err) {
        next(err);
    }
}

export const adminLogin = async (req, res, next) => {
    const { email, password } = req.body;
    console.log(req.user);
    try {
        let admin = await Admin.findOne({ email })

        if (!admin) return next(new AppError("Invalid credentials", STATUS.BAD_REQUEST));

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return next(new AppError("Invalid credentials", STATUS.BAD_REQUEST));


        if (admin.status === "pending") {
            //   return res.status(403).json({ message: "Your account is pending approval." });
            return sendResponse(res, STATUS.FORBIDDEN, "Your account approval is pending.");
        }
        if (admin.status === "rejected") {
            return sendResponse(res, STATUS.FORBIDDEN, "Your account is rejected. Contact admin for more details.");
        }

        const token = generatetoken(admin._id);

        res.cookie("AuthToken", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });

        sendResponse(res, STATUS.OK, "Admin logged in successfully.", { admin });
    } catch (err) {
        next(err);
    }
}

export const admin_create_manager = async (req, res, next) => {
    const adminId = req.user.userId;
    // console.log(adminId); 
    const { username, email, password, max_users } = req.body;

    try {
        const existingManager = await Manager.findOne({ email });
        if (existingManager) {
            return sendResponse(res, STATUS.BAD_REQUEST, "Manager with this email already exists.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newManager = new Manager({
            username,
            email,
            password: hashedPassword,
            created_by: adminId,
            admin_id: adminId,
            max_users,
        });

        await newManager.save();

        return sendResponse(res, STATUS.CREATED, "Manager created successfully.", { manager: newManager });
    } catch (err) {
        next(err);
    }
};


// super admin controllers
export const super_admin_login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        let super_admin = await SuperAdmin.findOne({ email })

        if (!super_admin) return next(new AppError("Invalid credentials", STATUS.BAD_REQUEST));

        const isMatch = await bcrypt.compare(password, super_admin.password);
        if (!isMatch) return next(new AppError("Invalid credentials", STATUS.BAD_REQUEST));

        const token = generatetoken(super_admin._id);

        res.cookie("AuthToken", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });

        sendResponse(res, STATUS.OK, "Super Admin logged in successfully.", { super_admin });
    } catch (err) {
        next(err);
    }
}

export const Super_admin_create_admin = async (req, res, next) => {
    const { company_name, email, password, status } = req.body;

    try {
        const existingAdmin = await Manager.findOne({ email })
        if (existingAdmin) {
            return sendResponse(res, STATUS.BAD_REQUEST, "Admin with this email already exists.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            company_name,
            email,
            password: hashedPassword,
            status: status
        });
        await newAdmin.save();

        return sendResponse(res, STATUS.CREATED, "Admin created successfully.", { Admin: newAdmin });
    } catch (err) {
        next(err);
    }
};

