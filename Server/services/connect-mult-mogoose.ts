import dotenv from "dotenv";
dotenv.config();

import mongoose, { type Connection } from "mongoose";

const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 5,
  retryWrites: true,
  retryReads: true,
};

async function connectDB(uri: string) {
  try {
    // Đăng ký sự kiện trước khi kết nối
    mongoose.connection.on("connected", function (this: Connection) {
      console.log("Connect db success", this.name);
    });

    mongoose.connection.on("disconnected", function (this: Connection) {
      console.log("Disconnect db success", this.name);
      setTimeout(() => connectDB(uri), 5000);
    });

    mongoose.connection.on("error", (err) => {
      console.log("Connect db fail", err);
      if (err.code === "ECONNRESET") {
        console.log("Connection reset by peer, retrying...");
      } else if (err.code === "ETIMEDOUT") {
        console.log("Connection timed out, retrying...");
      } else if (err.code === "ECONNREFUSED") {
        console.log("Connection refused, retrying...");
      }
      setTimeout(() => connectDB(uri), 5000);
    });

    // Thực hiện kết nối
    const conn = await mongoose.connect(uri, options);
    console.log("MongoDB connected successfully");

    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed through app termination");
        process.exit(0);
      } catch (err) {
        console.error("Error during MongoDB disconnection:", err);
        process.exit(1);
      }
    });

    return conn;
  } catch (err) {
    console.error("Initial connection error:", err);
    setTimeout(() => connectDB(uri), 5000);
  }
}

const EnglishDB = connectDB(process.env.MONGO_URI_ENGLISH as string);

export { EnglishDB };
