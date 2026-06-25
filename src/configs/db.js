import mongoose from "mongoose";

const connectToDB = async () => {
    try {
        if (mongoose.connections[0].readyState) {
            return true;
        } else {
            await mongoose.connect(process.env.MONGO_URL);
            console.log("Connected To DB :))");
        }
    } catch (err) {
        console.log("DB Connection has error -> ", err);
    }
};

export default connectToDB;
