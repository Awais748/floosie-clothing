import mongoose from "mongoose";

const connectDataBase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB);
    console.log("MongoDB is connected successfully to:", mongoose.connection.host);
  } catch (error) {
    console.error("MongoDb connection failed!");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    if (error.message.includes("IP")) {
      console.error("HINT: Please check your MongoDB Atlas IP Whitelist.");
    }
  }
};

export default connectDataBase;
