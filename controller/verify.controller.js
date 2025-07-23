import commandRunner from "../services/executor.service.js";
import { unlink } from "fs/promises";

export const verifyApkSignature = async (req, res) => {
  const apkPath = req.file?.path;

  if (!apkPath) {
    return res.status(400).json({ success: false, error: "No file uploaded." });
  }

  try {
    const [aaptOutput, signerOutput] = await Promise.all([
      commandRunner(`aapt dump badging "${apkPath}"`),
      commandRunner(`apksigner verify --verbose "${apkPath}"`),
    ]);

    const packageMatch = aaptOutput.match(
      /package: name='(.*?)' versionCode='(.*?)' versionName='(.*?)'/
    );
    const labelMatch = aaptOutput.match(/application-label:'(.*?)'/);

    const result = {
      success: true,
      app: {
        name: labelMatch?.[1] || "Unknown",
        package: packageMatch?.[1] || "Unknown",
        versionCode: packageMatch?.[2] || "Unknown",
        versionName: packageMatch?.[3] || "Unknown",
      },
    };

    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err?.toString() });
  } finally {
    await unlink(apkPath); // this now works ✅
  }
};
