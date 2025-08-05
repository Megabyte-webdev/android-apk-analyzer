import { unlink } from "fs/promises";
import AdmZip from "adm-zip";
import commandRunner from "../services/executor.service.js";

export const verifyApkSignature = async (req, res) => {
  const apkPath = req.file?.path;

  if (!apkPath) {
    return res.status(400).json({ success: false, error: "No file uploaded." });
  }

  try {
    // Run commands using JDK tools
    const [aaptOutput, signerOutput] = await Promise.all([
      commandRunner(`aapt dump badging "${apkPath}"`),
      commandRunner(`apksigner verify --print-certs "${apkPath}"`),
    ]);

    // Extract metadata
    const packageMatch = aaptOutput.match(
      /package: name='(.*?)' versionCode='(.*?)' versionName='(.*?)'/
    );
    const labelMatch = aaptOutput.match(/application-label:'(.*?)'/);
    const certFingerprintMatch = signerOutput.match(
      /SHA-256 digest:\s*([a-f0-9:]+)/i
    );

    const packageName = packageMatch?.[1] || "Unknown";
    const versionCode = packageMatch?.[2] || "Unknown";
    const versionName = packageMatch?.[3] || "Unknown";
    const appName = labelMatch?.[1] || "Unknown";
    const certFingerprint = certFingerprintMatch?.[1]?.trim();

    if (!certFingerprint) {
      throw new Error("Unable to extract certificate fingerprint.");
    }

    // Extract best icon path from aapt output
    const iconMatches = Array.from(
      aaptOutput.matchAll(/application-icon-\d+:'(.*?)'/g)
    );
    const iconPaths = iconMatches.map((m) => m[1]);

    // Pick the largest DPI (usually last)
    const bestIconPath = iconPaths[iconPaths.length - 1] || null;

    let iconBase64 = null;

    if (bestIconPath) {
      const zip = new AdmZip(apkPath);
      const iconEntry = zip.getEntry(bestIconPath);

      if (iconEntry) {
        const iconBuffer = iconEntry.getData();
        iconBase64 = `data:image/png;base64,${iconBuffer.toString("base64")}`;
      }
    }

    return res.json({
      success: true,
      app: {
        name: appName,
        package: packageName,
        versionCode,
        versionName,
        certificateFingerprint: certFingerprint,
        icon: iconBase64,
      },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.toString(),
    });
  } finally {
    try {
      if (apkPath) await unlink(apkPath);
    } catch (err) {
      console.error("Failed to delete APK file:", err.message);
    }
  }
};
