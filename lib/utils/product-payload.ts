import { getCloudinarySignatureAction } from "@/app/admin/products/upload/_actions/cloudinary-signature";

/**
 * Upload files directly from the client to Cloudinary using signed requests.
 * This bypasses Vercel's 4.5MB payload limit.
 */
export async function uploadImagesToStorage(files: (File | null)[]): Promise<string[]> {
    const validFiles = files.filter(f => f !== null) as File[];
    if (validFiles.length === 0) return [];

    const uploadPromises = validFiles.map(async (file) => {
        const folder = "awuraba/products";
        const isVideo = file.type.startsWith("video/");

        // 1. Get signature from server
        // We must include all parameters that will be signed
        const params: Record<string, any> = {
            folder,
        };

        if (isVideo) {
            params.format = "mp4";
        }

        const { signature, timestamp, cloudName, apiKey } = await getCloudinarySignatureAction(params);

        // 2. Prepare Form Data for direct upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey!);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);

        if (isVideo) {
            formData.append('format', 'mp4');
        }

        // 3. Upload directly to Cloudinary
        // We use 'auto' resource type to handle both images and videos
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('Cloudinary upload error:', error);
            throw new Error(error.error?.message || 'Upload failed');
        }

        const data = await response.json();
        return data.secure_url;
    });

    try {
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Storage upload error:', error);
        throw error;
    }
}
