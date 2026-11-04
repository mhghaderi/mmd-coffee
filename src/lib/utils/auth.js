import { hash, compare } from "bcryptjs";
import bcrypt from 'bcryptjs'; 

import { sign, verify } from "jsonwebtoken";

const hashPassword =async (password) => {
    const hashedPassword = await hash(password, 12);
    return hashedPassword;
};

const verifyPassword = async (password, hashPassword) => {
    const isvalid = await compare(password, hashPassword);
    return isvalid;
};

const generateAccessToken = (data) => {
    const token = sign({ ...data }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: "60s" });
    return token;
};

const verifyAccessToken = (token) => {
    try {
        const tokenPayload = verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
        return tokenPayload;
    } catch (err) {
        console.log("Verify access token error -> ", err);
        return false;
    }
};

const generateRefreshToken = (data) => {
    const token = sign({ ...data }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: "15d" });
    return token;
};

export { hashPassword, verifyPassword, generateAccessToken, verifyAccessToken , generateRefreshToken};
