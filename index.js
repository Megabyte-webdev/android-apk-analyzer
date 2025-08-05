import express from "express";
import { config } from "dotenv";
import cors from "cors";
import verifyRouter from "./routes/verify.routes.js";

config();
const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5000;
app.use("/app/verify", verifyRouter);

app;
app.listen(PORT, () => {
  console.log(`✅ APK Verifier API running at http://localhost:${PORT}`);
});

