//any user - clerk id, username, email, avatar
import mongoose from "mongoose";

interface User {
  clerkId: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  createdAt: Date;
  updatedAt: Date;
}

//schema rules shifted at the application layer
const userSchema = new mongoose.Schema<User>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      min: 3,
      max: 200,
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model("User", userSchema);
