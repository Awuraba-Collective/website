import { Prisma } from "@/app/generated/prisma";

export function serializePrisma<T>(data: T): any {
  if (data === null || data === undefined) return data;

  if (data instanceof Prisma.Decimal) {
    return data.toNumber();
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(serializePrisma);
  }

  if (typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, serializePrisma(v)])
    );
  }

  return data;
}
