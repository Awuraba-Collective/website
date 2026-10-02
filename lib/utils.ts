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
 * Cleans a media URL by trimming and removing all internal whitespace/newlines.
 */
export function cleanMediaUrl(src: string | null | undefined): string {
  if (!src) return "";
  return src.trim().replace(/\s/g, "");
}

/**
 * Returns a thumbnail URL for a given media source.
 * For video sources, replaces the file extension with .jpg to use as a still thumbnail.
 */
export function getMediaThumbnail(src: string | null | undefined): string {
  const cleanSrc = cleanMediaUrl(src);
  if (!cleanSrc) return "";
  return cleanSrc.replace(/\.(mp4|mov|webm|ogg)$/i, ".jpg");
}
