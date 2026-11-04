import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "نام کاربر الزامی است"],
            trim: true,
            minlength: [2, "نام باید حداقل ۲ کاراکتر باشد"],
            maxlength: [80, "نام نمی‌تواند بیشتر از ۸۰ کاراکتر باشد"],
        },

        email: {
            type: String,
            required: [true, "ایمیل الزامی است"],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: [150, "ایمیل بیش‌ازحد طولانی است"],
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "فرمت ایمیل معتبر نیست"],
            index: true,
        },

        password: {
            type: String,
            required: [true, "رمز عبور الزامی است"],
            minlength: [4, "رمز عبور باید حداقل ۴ کاراکتر باشد"],
            select: false,
        },

        role: {
            type: String,
            enum: {
                values: ["user", "admin"],
                message: "نقش کاربر معتبر نیست",
            },
            default: "user",
            index: true,
        },

        phone: {
            type: String,
            trim: true,
            default: "",
            maxlength: [20, "شماره تماس معتبر نیست"],
        },

        avatar: {
            type: String,
            trim: true,
            default: "",
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        emailVerified: {
            type: Boolean,
            default: false,
        },

        lastLoginAt: {
            type: Date,
            default: null,
        },

        tokenVersion: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,

        toJSON: {
            transform(document, returnedObject) {
                delete returnedObject.password;
                delete returnedObject.tokenVersion;

                return returnedObject;
            },
        },
    },
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
