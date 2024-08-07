import mongoose from "mongoose";

import { DB_NAME } from "../utils/constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );

    console.log(
      "\n MongoDB Connected Successfully...\n DB_host : ",
      connectionInstance.connection.host
    );
  } catch (e) {
    console.log("Failed to connect mongoDB :", e);
    process.exit(1);
  }
};

export default connectDB;
