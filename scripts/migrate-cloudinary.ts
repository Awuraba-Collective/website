import "dotenv/config";

import { v2 as cloudinary } from "cloudinary";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, BUCKET } from "../lib/s3";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function migrateAll(resourceType: "image" | "video") {
  let nextCursor: string | undefined;

  do {
    const result = await cloudinary.api.resources({
      resource_type: resourceType,
      max_results: 100,
      next_cursor: nextCursor,
    });

    for (const asset of result.resources) {
      const url = cloudinary.url(asset.public_id, {
        resource_type: resourceType,
        format: asset.format,
      });

      const response = await fetch(url);
      const buffer = Buffer.from(await response.arrayBuffer());

      const key = `${resourceType}s/${asset.public_id}.${asset.format}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: buffer,
          ContentType:
            response.headers.get("content-type") || "application/octet-stream",
        }),
      );

      console.log(`✓ ${key}`);
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);
}

async function main() {
  await migrateAll("image");
  await migrateAll("video");
}

main().catch(console.error);
