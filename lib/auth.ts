import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { admin, phoneNumber } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./database";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    phoneNumber({
      sendOTP: ({ phoneNumber, code }, ctx) => {
        // Implement sending OTP code via SMS
      },
    }),
    admin({}),
    nextCookies(),
  ],
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: ["https://awuraba.co", "https://www.awuraba.co"],
});

export const getServerAuthSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
};

/**
 * Ensure current session is an authenticated admin.
 * Use in server actions - throws error on failure.
 */
export async function requireAdmin(): Promise<{
  userId: string;
  role: string;
}> {
  const session = await getServerAuthSession();

  if (!session?.user) {
    throw new Error("Unauthorized: Not authenticated");
  }

  if (session.user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return {
    userId: session.user.id,
    role: session.user.role,
  };
}

/**
 * Ensure current session is an authenticated admin.
 * Use in API routes - returns error response on failure.
 */
export async function requireAdminApi(): Promise<
  | { success: true; userId: string; role: string }
  | { success: false; response: Response }
> {
  const session = await getServerAuthSession();

  if (!session?.user) {
    return {
      success: false,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (session.user.role !== "admin") {
    return {
      success: false,
      response: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { success: true, userId: session.user.id, role: session.user.role };
}
