import jwt from "jsonwebtoken";

export const generatetoken = (userId,role) => {
    console.log(userId);
    console.log(role);
    const token = jwt.sign({ userId, role : role }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });

    return token;
};