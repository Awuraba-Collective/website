'use server';

import { requireAdminApi } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

/**
 * Generates a signed upload signature for Cloudinary.
 * This allows the client to upload files directly while keeping secrets on the server.
 */
export async function getCloudinarySignatureAction(params: Record<string, any>) {
    const auth = await requireAdminApi();
    if (!auth.success) {
        throw new Error("Unauthorized");
    }

    const timestamp = Math.round(new Date().getTime() / 1000);

    // Create params for signing (excluding file/data but including timestamp and folder)
    const signature = cloudinary.utils.api_sign_request(
        {
            ...params,
            timestamp,
        },
        process.env.CLOUDINARY_API_SECRET!
    );

    return {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
    };
}
