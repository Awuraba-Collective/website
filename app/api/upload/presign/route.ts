import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import { s3, BUCKET, CDN_URL } from "@/lib/s3";
import { v4 as uuid } from "uuid";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export async function POST(req: NextRequest) {
  const { filename, contentType, fileSize } = await req.json();

  const isImage = ALLOWED_IMAGE_TYPES.includes(contentType);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(contentType);

  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "Unsupported file type" },
      { status: 400 },
    );
  }

  const maxSize = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (fileSize > maxSize) {
    return NextResponse.json(
      {
        error: `File too large. Max ${maxSize / 1024 / 1024}MB for ${isImage ? "images" : "videos"}`,
      },
      { status: 413 },
    );
  }

  const folder = isImage ? "images" : "videos";
  const ext = filename.split(".").pop();
  const key = `${folder}/${uuid()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: fileSize,
  });

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min

  return NextResponse.json({
    presignedUrl,
    cdnUrl: `${CDN_URL}/${key}`, // the permanent public URL to store in your DB
    key,
  });
}
