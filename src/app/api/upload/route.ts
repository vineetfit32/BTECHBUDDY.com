import { NextResponse } from "next/server";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and standard images (JPEG, PNG, WEBP) are allowed." },
        { status: 400 }
      );
    }

    // Limit to 50MB
    const maxSizeBytes = 50 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: "File exceeds maximum allowed size of 50MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : ".bin");
    const uniqueName = `${crypto.randomUUID()}${fileExt}`;
    const destinationPath = path.join(uploadDir, uniqueName);

    fs.writeFileSync(destinationPath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      fileSize: sizeInMB,
      fileType: file.type === "application/pdf" ? "PDF" : "IMAGE",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
