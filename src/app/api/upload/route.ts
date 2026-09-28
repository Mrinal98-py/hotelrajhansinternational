import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const revalidate = 0;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_DOC_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const uploadCategory = (formData.get("category") as string) || "general"; // 'gallery', 'documents', 'cms'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = ALLOWED_MIME_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Invalid file format. Allowed types: JPEG, PNG, WEBP, PDF." },
        { status: 400 }
      );
    }

    const isPdf = file.type === "application/pdf";
    const maxBytes = isPdf ? MAX_DOC_BYTES : MAX_IMAGE_BYTES;

    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File exceeds maximum allowed size of ${isPdf ? "10MB" : "5MB"}` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subdirectory based on category
    const subDir = uploadCategory === "documents" ? "documents" : "uploads";
    const targetDir = path.join(process.cwd(), "public", subDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Secure random unique filename to prevent path traversal or overwrites
    const randomHash = crypto.randomBytes(12).toString("hex");
    const sanitizedBase = file.name
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 30);
    const filename = `${Date.now()}_${sanitizedBase}_${randomHash}${ext}`;
    const filePath = path.join(targetDir, filename);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/${subDir}/${filename}`;
    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
