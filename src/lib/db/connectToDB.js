import mongoose from "mongoose";

const connectToDB = async () => {
    try {
        //اطمینان از بودن مسیر برای اتصال
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL is not defined :((");
        }
        if (mongoose.connection.readyState === 1) {
            // اینجا 1 یعنی اتصال از قبل بر قراره
            console.log("Already Connected To MongoDB :))");
            return mongoose.connection;
        }
        // اگه برقرار نبود اینجا برقرار میشه
        const connection = await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB :))");
        return connection;
    } catch (err) {
        console.log("MongoDB Connection Error => ", err);
        throw err;
    }
};

export default connectToDB;

// به جای ریترن ثرو کردم که اگه مشکلی بود توی کدی که
// این تابع اجرا شده به مشکل دسترسی داشته باشیم و هندل بشه و برنامه ادامه پیدا نکنه
