import express from "express";
import { authRouter } from "./routes/authRoute";
import { chatRouter } from "./routes/chatRoute";
import { messageRouter } from "./routes/messageRoute";
import { userRouter } from "./routes/userRoute";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler } from "./middlewares/error";

const app = express();

app.use(clerkMiddleware());

app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);
app.use("/api/user", userRouter);

app.use(errorHandler);
app.use((req, res) => {
  res.sendStatus(404);
});
export default app;
