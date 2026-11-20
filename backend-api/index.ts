import ExpressApp from "./src/app";
import { connectDB } from "./src/config/database";
import { createServer } from "http";
import { initializeSocket } from "./src/utils/socket";

const BACKEND_PORT = process.env.PORT ?? 6969;
const MONGO_DB_URI = process.env.MONGO ?? null;

const httpServer = createServer(ExpressApp);
initializeSocket(httpServer);

if (!MONGO_DB_URI) {
  throw new Error("add 'MONGO' (mongo db uri) in .env");
}
try {
  connectDB(MONGO_DB_URI).then(() => {

    httpServer.listen(BACKEND_PORT, () => {
      console.log(
        `express server server started on port ${BACKEND_PORT} ${String.fromCodePoint(0x2713)}`,
      );
    });
  });
} catch (err) {
  console.log(err);
  process.exit(1);
}
