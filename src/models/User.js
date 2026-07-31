import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: false,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        phone: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: false,
        },
        role: {
            type: String,
            enum: ["USER", "ADMIN"],
            default: "USER",
        },
        refreshToken: String,
    },
    {
        timestamps: true,
    },
);

const model = mongoose.models.User || mongoose.model("User", userSchema);

export default model;
