import { Size, Length, FitCategoryType } from "@/app/generated/prisma";
import type {
  Size as ClientSize,
  Length as ClientLength,
  FitCategory as ClientFitCategory,
} from "@/types/shop";

/**
 * Generate a unique order number in format: AWR-YYMMDD-XXXX
 * where XXXX is a random alphanumeric string
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, "0");
  const dd = now.getDate().toString().padStart(2, "0");

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `AWR-${yy}${mm}${dd}-${suffix}`;
}

/**
 * Map client-side Size type to Prisma enum
 */
export function mapSizeToEnum(size: ClientSize): Size {
  const mapping: Record<ClientSize, Size> = {
    XS: Size.XS,
    S: Size.S,
    M: Size.M,
    L: Size.L,
    XL: Size.XL,
    XXL: Size.XXL,
    Custom: Size.CUSTOM,
  };
  return mapping[size];
}

/**
 * Map client-side Length type to Prisma enum
 */
export function mapLengthToEnum(length: ClientLength): Length {
  const mapping: Record<ClientLength, Length> = {
    Petite: Length.PETITE,
    Regular: Length.REGULAR,
    Tall: Length.TALL,
  };
  return mapping[length];
}

/**
 * Map client-side FitCategory type to Prisma enum
 */
export function mapFitToEnum(fit: ClientFitCategory): FitCategoryType {
  const mapping: Record<ClientFitCategory, FitCategoryType> = {
    Standard: FitCategoryType.STANDARD,
    Loose: FitCategoryType.LOOSE,
  };
  return mapping[fit];
}
