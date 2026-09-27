import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db.js";

const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
const cookieDomain = process.env.COOKIE_DOMAIN;
const shareAcrossSubdomains = Boolean(cookieDomain?.startsWith("."));

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:4000",
  basePath: "/v1/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [webOrigin],
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
    async sendResetPassword({ url }) {
      if (!process.env.RESEND_API_KEY) {
        console.info(`password reset link: ${url}`);
        return;
      }
    },
  },
  user: {
    additionalFields: {
      nameLatin: { type: "string", required: false },
      role: { type: "string", required: false, input: false, defaultValue: "STUDENT" },
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
    ...(shareAcrossSubdomains
      ? { crossSubDomainCookies: { enabled: true, domain: cookieDomain } }
      : {}),
  },
});
