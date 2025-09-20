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
import { sendEmail } from "../utils/sendEmail.js";
import { userCredentialsEmail } from "../templates/userCredentialsEmail.js";



// login
export const login = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role)
            return sendResponse(res, STATUS.BAD_REQUEST, "Please provide all fields");
        if (role !== "admin" && role !== "manager" && role !== "user" && role !== "super_admin")
            return sendResponse(res, STATUS.BAD_REQUEST, "Invalid role")
        let user;

        if (role === "admin") {
            user = await Admin.findOne({ email });
        }
        else if (role === "manager") {
            user = await Manager.findOne({ email });
        }
        else if (role === "user") {
            user = await User.findOne({ email });
        }
        else if (role === "super_admin") {
            user = await SuperAdmin.findOne({ email });
        }

        if (!user) return next(new AppError("Invalid credentials", STATUS.BAD_REQUEST));

        if(role === "admin" && user.status !== "approved") return sendResponse(res, STATUS.FORBIDDEN, "Admin not approved")
        if(user.isBlocked && role !== "super_admin") return sendResponse(res, STATUS.FORBIDDEN, "Your Organization is blocked")

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return next(new AppError("Invalid credentials", STATUS.BAD_REQUEST));

        const token = generatetoken(user._id, role);

        res.cookie("AuthToken", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });

        sendResponse(res, STATUS.OK, `${role} logged in successfully.`, {role: role});
    } catch (error) {
        next(error)
    }

}

// getme
export const getMe = async (req, res, next) => {
    try {
        const userData =
            (await User.findById(req.user.userId).select("-password")) ||
            (await Manager.findById(req.user.userId).select("-password")) ||
            (await Admin.findById(req.user.userId).select("-password")) ||
            (await SuperAdmin.findById(req.user.userId).select("-password"));

        if (!userData) {
            return sendResponse(res, STATUS.NOT_FOUND, "User not found");
        }

        return sendResponse(res, STATUS.OK, "User profile fetched successfully", {
            user: userData,
        });
    } catch (err) {
        next(err);
    }
};




// manager controllers
export const manager_create_user = async (req, res, next) => {
    const managerId = req.user.userId;
    const manager = await Manager.findById(managerId);

    if (!manager) {
        return next(new AppError("Manager not found.", STATUS.UNAUTHORIZED));
    }

    if (manager.current_user_count >= manager.max_users) {
        return sendResponse(res, STATUS.FORBIDDEN, "User creation limit reached for this manager.");
    }

    const adminId = manager.admin_id;
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

        manager.current_user_count += 1;
        await manager.save();

        // send email with credentials
        sendEmail(
            email,
            "Your Account Credentials ✔",
            userCredentialsEmail(username, email, password, "Manager") // send original password here
        );

        return sendResponse(res, STATUS.CREATED, "User created successfully & credentials emailed.", {});
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
            return sendResponse(res, STATUS.BAD_REQUEST, "Admin with this email already exists.");

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
        sendEmail(
            email,
            "Your Account Credentials ✔",
            userCredentialsEmail(username, email, password, "Admin") // send original password here
        );

        await newManager.save();

        return sendResponse(res, STATUS.CREATED, "Manager created successfully & credentials emailed.", {});
    } catch (err) {
        next(err);
    }
};


// super admin controllers
export const Super_admin_create_admin = async (req, res, next) => {
    const { company_name, email, password } = req.body;

    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return sendResponse(res, STATUS.BAD_REQUEST, "Admin with this email already exists.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            company_name,
            email,
            password: hashedPassword,
            status: "approved"
        });

        sendEmail(
            email,
            "Your Account Credentials ✔",
            userCredentialsEmail(company_name, email, password, "Super_admin" ) // send original password here
        );

        await newAdmin.save();

        return sendResponse(res, STATUS.CREATED, "Admin created successfully & credentials emailed.", {});
    } catch (err) {
        next(err);
    }
};
