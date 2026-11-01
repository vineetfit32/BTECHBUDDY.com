import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { detectFileType } from "@/lib/file-type";
import { datedKey, fileUrl, getStorage } from "@/lib/storage";
import { enforceRateLimits } from "@/lib/rate-limit";
import { formatBytes } from "@/lib/utils";

const MAX_DOCUMENT_BYTES = 50 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const limited = enforceRateLimits([{ key: `upload:${user.id}`, limit: 30, windowMs: 10 * 60_000 }]);
    if (limited) return limited;

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_DOCUMENT_BYTES) {
      return NextResponse.json({ error: "File exceeds maximum allowed size of 50MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = detectFileType(buffer.subarray(0, 32));
    if (!detected || detected.kind === "VIDEO") {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and standard images (JPEG, PNG, WEBP) are allowed. Upload videos from the Videos admin." },
        { status: 400 }
      );
    }

    const key = datedKey("uploads", `${crypto.randomUUID()}${detected.ext}`);
    const storage = await getStorage();
    await storage.put(key, buffer, detected.mime, buffer.length);

    return NextResponse.json({
      success: true,
      url: fileUrl(key),
      key,
      fileName: file.name,
      fileSize: formatBytes(file.size),
      fileType: detected.kind,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
