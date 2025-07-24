import { Router } from "express";
import { verifyApkSignature } from "../controller/verify.controller.js";
import upload from "../middleware/multer.js";
import malwareScanner from "../middleware/malwareScanner.js";

const verifyRouter = Router();

verifyRouter.post(
  "/",
  upload.single("apk"),
  malwareScanner,
  verifyApkSignature
);

export default verifyRouter;
