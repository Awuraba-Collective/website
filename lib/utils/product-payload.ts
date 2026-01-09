import { ProductFormValues, ProductApiPayload } from "@/lib/validations/product";

/**
 * Dummy function to simulate file upload to storage
 * In production, this would upload to S3, Cloudinary, etc.
 */
export async function uploadImagesToStorage(files: (File | null)[]): Promise<string[]> {
    const validFiles = files.filter(f => f !== null) as File[];
    if (validFiles.length === 0) return [];

    const formData = new FormData();
    validFiles.forEach(file => {
        formData.append('files', file);
    });

    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            throw new Error('Upload failed');
        }

        const data = await res.json();
        return data.urls;
    } catch (error) {
        console.error('Storage upload error:', error);
        throw error;
    }
}
