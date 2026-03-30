/**
 * Upload files directly from the client to S3 via presigned URLs.
 * This bypasses Vercel's 4.5MB payload limit.
 */
export async function uploadImagesToStorage(files: (File | null)[]): Promise<string[]> {
    const validFiles = files.filter(f => f !== null) as File[];
    if (validFiles.length === 0) return [];

    const uploadPromises = validFiles.map(async (file) => {
        // 1. Request a presigned URL + CDN URL from our API
        const res = await fetch("/api/upload/presign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                filename: file.name,
                contentType: file.type,
                fileSize: file.size,
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to get presigned URL");
        }

        const { presignedUrl, cdnUrl } = await res.json();

        // 2. Upload directly to S3 using the presigned URL
        const uploadRes = await fetch(presignedUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
        });

        if (!uploadRes.ok) {
            throw new Error("Upload to S3 failed");
        }

        // 3. Return the permanent CloudFront CDN URL to store in the DB
        return cdnUrl as string;
    });

    try {
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error("Storage upload error:", error);
        throw error;
    }
}
