import { fork } from "node:child_process";
import path from "node:path";
import process from "node:process";

const scripts = [
    "seed-users.mjs",
    "seed-site-content.mjs",
    "seed-full-catalog.mjs",
    "seed-activity.mjs",
];

console.log("====================================================");
console.log("☕ شروع فرآیند جامع ایمپورت داده‌های اولیه ممد کافی");
console.log("====================================================");

async function runScript(scriptName) {
    return new Promise((resolve, reject) => {
        const fullPath = path.join(process.cwd(), "scripts", scriptName);
        console.log(`\n▶ اجرای ${scriptName}...`);
        const proc = fork(fullPath, [], { stdio: "inherit" });

        proc.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`اسکریپت ${scriptName} با کد ${code} متوقف شد.`));
            }
        });

        proc.on("error", (err) => {
            reject(err);
        });
    });
}

async function main() {
    for (const script of scripts) {
        await runScript(script);
    }

    console.log("\n====================================================");
    console.log("🎉 تمامی اطلاعات اولیه و فیک با موفقیت ایمپورت شدند!");
    console.log("====================================================");
    console.log("اطلاعات ورود برای ارائه و تست:");
    console.log("🔑 پنل مدیریت (Admin):");
    console.log("   ایمیل: admin@mmdcoffee.com");
    console.log("   رمز عبور: admin");
    console.log("----------------------------------------------------");
    console.log("👤 کاربران عادی (Users):");
    console.log("   ایمیل: user1@mmdcoffee.test تا user40@mmdcoffee.test");
    console.log("   رمز عبور: pass1234");
    console.log("====================================================\n");
}

main().catch((err) => {
    console.error("\n❌ خطا در فرآیند seed-all:", err.message);
    process.exit(1);
});
