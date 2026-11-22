import mongoose from "mongoose";
import ExpressApp from "./src/app";
import { createServer } from "http";
const BACKEND_PORT = process.env.PORT ?? 6969;
const MONGO_DB_URI = process.env.MONGO ?? null;
const httpServer = createServer(ExpressApp);

if (!MONGO_DB_URI) {
  throw new Error("add 'MONGO' (mongo db uri) in .env");
}
try {
  const connected = await mongoose.connect(MONGO_DB_URI);
  console.log(`MONGO DB CONNECTED ${String.fromCodePoint(0x2713)}`);
  httpServer.listen(BACKEND_PORT, () => {
    console.log(
      `express server server started on port ${BACKEND_PORT} ${String.fromCodePoint(0x2713)}`,
    );
  });
} catch (err) {
  console.error(err);
  process.exit(1);
}
