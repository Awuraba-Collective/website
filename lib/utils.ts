import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Returns a thumbnail URL for a given media source.
 * If the source is a video (Cloudinary), it replaces the extension with .jpg
 */
export function getMediaThumbnail(src: string | null | undefined): string {
  if (!src) return "";
  return src.replace(/\.(mp4|mov|webm|ogg)$/i, ".jpg");
}
