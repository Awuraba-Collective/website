'use server';

import { requireAdminApi } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export async function uploadFileAction(formData: FormData) {
    const auth = await requireAdminApi();
    if (!auth.success) {
        throw new Error("Unauthorized");
    }

    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
        throw new Error("No files provided");
    }

    // Validate file types and sizes
    for (const file of files) {
        if (!ALLOWED_TYPES.includes(file.type)) {
            throw new Error(`Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(", ")}`);
        }
        if (file.size > MAX_SIZE) {
            throw new Error(`File too large: ${file.name}. Maximum size is 50MB.`);
        }
    }

    const uploadPromises = files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise<string>((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: "awuraba/products",
                        resource_type: "auto",
                        ...(file.type.startsWith("video/") && { format: "mp4" }),
                    },
                    (
                        error: Error | undefined,
                        result: any
                    ) => {
                        if (error) {
                            console.error("Cloudinary upload error:", error);
                            reject(error);
                        } else {
                            resolve(result?.secure_url || "");
                        }
                    },
                )
                .end(buffer);
        });
    });

    const urls = await Promise.all(uploadPromises);
    return { urls };
}
