import mongoose from "mongoose";

const url = process.env.MONGODB_URL || "mongodb://localhost:27017/unite";

mongoose.connect(url);

mongoose.connection.once("open", async () => {
    console.log("Connected to the Database.");
});