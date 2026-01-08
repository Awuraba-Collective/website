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
});

export const getServerAuthSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
};
