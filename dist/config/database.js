import mongoose from "mongoose";
const connectDB = async () => {
    await mongoose.connect("mongodb+srv://codeflareapp:d18aYjZ3icxMmAav@cluster0codeflare.vp3x4.mongodb.net/");
};
export { connectDB };
