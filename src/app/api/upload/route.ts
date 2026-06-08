import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getProductUploadDir, uploadImageToFtp } from "@/lib/ftp";

export const maxDuration = 60;

const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const dirName =
      (formData.get("dirName") as string)?.trim() || getProductUploadDir();

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Image must be under 8MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, fileName } = await uploadImageToFtp(buffer, file.name, dirName);

    return NextResponse.json({
      message: "File uploaded successfully",
      url,
      file: { name: fileName, type: file.type, url },
    });
  } catch (err) {
    console.error("Upload error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
