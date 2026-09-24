import mongoose from "mongoose";
import logger from "../utils/logger/logger.js";

const connectDB = async () => {
  try {
    const uri = process.env.DB_URI || "mongodb://127.0.0.1:27017/whisperly";
    await mongoose.connect(uri);
    logger.info("Database connected successfully ✅");
  } catch (error) {
    logger.error(`Database connection failed ❌: ${error.message}`);
    // Fail fast: without a DB the app cannot serve requests.
    process.exit(1);
  }
};

export default connectDB;
