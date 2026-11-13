import express from "express";
import { authRouter } from "./routes/authRoute";
import { chatRouter } from "./routes/chatRoute";
import { messageRouter } from "./routes/messageRoute";
import { userRouter } from "./routes/userRoute";

const app = express();

app.use("/api/auth", authRouter);
app.use("/api/auth", chatRouter);
app.use("/api/auth", messageRouter);
app.use("/api/auth", userRouter);

export default app;
