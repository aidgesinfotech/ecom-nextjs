import { Client } from "basic-ftp";
import { Readable } from "stream";

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

export function getFtpConfig() {
  const host = process.env.FTP_HOST;
  const user = process.env.FTP_USER;
  const password = process.env.FTP_PASSWORD;
  const baseURL = process.env.FTP_BASE_URL;
  const uploadDir = process.env.FTP_UPLOAD_DIR || "/public_html/";
  const secure = process.env.FTP_SECURE === "true";

  if (!host || !user || !password || !baseURL) {
    throw new Error("FTP is not configured. Set FTP_HOST, FTP_USER, FTP_PASSWORD, FTP_BASE_URL in .env.local");
  }

  return { host, user, password, baseURL, uploadDir, secure };
}

export function getProductUploadDir() {
  return process.env.FTP_PRODUCT_DIR || "aikvis-products";
}

export async function uploadImageToFtp(
  buffer: Buffer,
  originalName: string,
  directoryName: string
): Promise<{ url: string; fileName: string }> {
  const config = getFtpConfig();
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";

  if (!ALLOWED_EXT.has(ext)) {
    throw new Error("Only JPG, PNG, WebP, and GIF images are allowed.");
  }

  const fileName = `${Date.now()}.${ext}`;
  const remoteDir = `${config.uploadDir}${directoryName}/`;
  const remotePath = `${remoteDir}${fileName}`;

  const client = new Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host: config.host,
      user: config.user,
      password: config.password,
      secure: config.secure,
    });
    await client.ensureDir(remoteDir);
    await client.uploadFrom(Readable.from(buffer), remotePath);
    const url = `https://${config.baseURL}/${directoryName}/${fileName}`;
    return { url, fileName };
  } finally {
    client.close();
  }
}
