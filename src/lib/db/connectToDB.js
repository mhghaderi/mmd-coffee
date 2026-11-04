import mongoose from "mongoose";

const connectToDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        const mongoUri =
            process.env.MONGO_URL ||
            process.env.MONGODB_URI ||
            "mongodb://127.0.0.1:27017/mmd-coffee";

        const connection = await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB :))");
        return connection;
    } catch (err) {
        console.error("MongoDB Connection Error => ", err);
        throw err;
    }
};

export default connectToDB;
