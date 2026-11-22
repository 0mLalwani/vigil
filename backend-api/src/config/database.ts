import mongoose from "mongoose";

export const connectDB = async (uri: string) => {
  try {
    const connected = await mongoose.connect(uri);
    console.log(`MONGO DB CONNECTED ${String.fromCodePoint(0x2713)}`);
  } catch (e) {
    console.log(e);
  }
};
