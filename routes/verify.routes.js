import { Router } from "express";
import { verifyApkSignature } from "../controller/verify.controller.js";
import upload from "../middleware/multer.js";

const verifyRouter = Router();

verifyRouter.post("/", upload.single("apk"), verifyApkSignature);

export default verifyRouter;
