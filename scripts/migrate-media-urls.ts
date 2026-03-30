// scripts/migrate-media-urls.ts
import { prisma } from "@/lib/database";
import "dotenv/config";

const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL!; // e.g. https://dXXXXX.cloudfront.net
const CLOUDINARY_BASE = "https://res.cloudinary.com";

function toCloudFrontUrl(cloudinaryUrl: string): string | null {
  // Extract the public_id path from the Cloudinary URL
  // e.g. https://res.cloudinary.com/your-cloud/image/upload/v123/awuraba/products/abc.jpg
  //                                                            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ this becomes the S3 key
  const match = cloudinaryUrl.match(
    /\/(?:image|video)\/upload\/(?:v\d+\/)?(.+)$/,
  );
  if (!match) return null;

  const key = match[1]; // e.g. awuraba/products/abc.jpg
  const type = cloudinaryUrl.includes("/video/") ? "videos" : "images";

  return `${CLOUDFRONT_URL}/${type}/${key}`;
}

async function main() {
  const allMedia = await prisma.productMedia.findMany();

  console.log(`Found ${allMedia.length} records to migrate`);

  let updated = 0;
  let skipped = 0;

  for (const media of allMedia) {
    // Skip if already migrated
    if (!media.src.startsWith(CLOUDINARY_BASE)) {
      skipped++;
      continue;
    }

    const newUrl = toCloudFrontUrl(media.src);
    if (!newUrl) {
      console.warn(`⚠️  Could not parse URL for id=${media.id}: ${media.src}`);
      skipped++;
      continue;
    }

    await prisma.productMedia.update({
      where: { id: media.id },
      data: { src: newUrl },
    });

    console.log(`✓ ${media.src}\n  → ${newUrl}`);
    updated++;
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
}

// main()
//   .catch(console.error)
//   .finally(() => prisma.$disconnect());

async function main2() {
  const broken = await prisma.productMedia.findMany({
    where: { src: { startsWith: "d1sj8wmh6woi8q.cloudfront.net" } },
  });

  console.log(`Fixing ${broken.length} records...`);

  for (const media of broken) {
    await prisma.productMedia.update({
      where: { id: media.id },
      data: { src: `https://${media.src}` },
    });
    console.log(`✓ ${media.id}`);
  }

  console.log(`Done. Fixed ${broken.length} records.`);
}

main2()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
