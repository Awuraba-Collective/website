import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
    const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL,
        max: 3, // connections per function instance (pg ignores connection_limit in the URL)
        idleTimeoutMillis: 10_000, // close idle connections after 10s
    });
    return new PrismaClient({
        adapter,
        log: ["error"],
    });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
