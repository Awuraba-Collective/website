import { uploadFileAction } from "@/app/admin/products/upload/_actions/upload-action";

/**
 * Upload files via Server Action to bypass Vercel payload limits
 */
export async function uploadImagesToStorage(files: (File | null)[]): Promise<string[]> {
    const validFiles = files.filter(f => f !== null) as File[];
    if (validFiles.length === 0) return [];

    const formData = new FormData();
    validFiles.forEach(file => {
        formData.append('files', file);
    });

    try {
        const { urls } = await uploadFileAction(formData);
        return urls;
    } catch (error) {
        console.error('Storage upload error:', error);
        throw error;
    }
}
