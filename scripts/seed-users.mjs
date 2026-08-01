import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        const separator = line.indexOf("=");
        if (separator === -1) continue;

        const key = line.slice(0, separator).trim();
        let value = line.slice(separator + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        if (!process.env[key]) process.env[key] = value;
    }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

const mongoUrl =
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    process.env.MONGODB_URL;

if (!mongoUrl) {
    console.error("❌ MONGO_URL / MONGODB_URI داخل .env.local پیدا نشد.");
    process.exit(1);
}

const PASSWORD = "pass1234";
const TOTAL_USERS = 40;

await mongoose.connect(mongoUrl);

try {
    const users = mongoose.connection.collection("users");
    const hashedPassword = await bcrypt.hash(PASSWORD, 12);
    const now = new Date();

    const operations = Array.from({ length: TOTAL_USERS }, (_, index) => {
        const number = index + 1;
        const name = `user${number}`;
        const email = `user${number}@mmdcoffee.test`;
        const phone = `0912${String(number).padStart(7, "0")}`;

        return {
            updateOne: {
                filter: { email },
                update: {
                    $set: {
                        name,
                        email,
                        phone,
                        password: hashedPassword,
                        role: "user",
                        isActive: true,
                        emailVerified: true,
                        updatedAt: now,
                    },
                    $setOnInsert: {
                        tokenVersion: 0,
                        createdAt: now,
                    },
                },
                upsert: true,
            },
        };
    });

    const result = await users.bulkWrite(operations, { ordered: false });

    console.log("✅ کاربران تستی آماده شدند.");
    console.log(`تعداد: ${TOTAL_USERS}`);
    console.log("نام‌ها: user1 تا user40");
    console.log("ایمیل نمونه: user1@mmdcoffee.test");
    console.log(`رمز همه کاربران: ${PASSWORD}`);
    console.log(
        `Created: ${result.upsertedCount || 0} | Updated: ${result.modifiedCount || 0}`,
    );
} finally {
    await mongoose.disconnect();
}
