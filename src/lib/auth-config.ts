import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Nodemailer from "next-auth/providers/nodemailer";
import { getDb, schema } from "@/lib/db";
import { sendMail } from "@/lib/email";
import { env, features } from "@/lib/env";

export const authConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .toLowerCase()
          .trim();
        const password = String(credentials?.password ?? "");
        if (!email || password.length < 8) return null;
        const db = getDb();
        if (!db) return null;
        const [user] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email))
          .limit(1);
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
    ...(features.email && env.GMAIL_USER
      ? [
          Nodemailer({
            server: {
              host: "smtp.gmail.com",
              port: 465,
              secure: true,
              auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD },
            },
            from: env.CONTACT_FROM_EMAIL ?? `Estudio <${env.GMAIL_USER}>`,
            async sendVerificationRequest({ identifier, url }) {
              await sendMail({
                to: identifier,
                subject: "Tu enlace de acceso al portal",
                text: [
                  "Hola:",
                  "",
                  "Usá este enlace para entrar al portal de clientes (válido unos minutos):",
                  url,
                  "",
                  "Si no pediste acceso, ignorá este mensaje.",
                ].join("\n"),
              });
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/portal/login",
    error: "/portal/login",
    verifyRequest: "/portal/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "nodemailer") {
        const db = getDb();
        if (!db || !user.email) return false;
        const [existing] = await db
          .select({ id: schema.users.id })
          .from(schema.users)
          .where(eq(schema.users.email, user.email.toLowerCase()))
          .limit(1);
        return Boolean(existing);
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.sub = user.id;
        token.mfaVerified = false;
      }
      if (trigger === "update" && session && typeof session === "object") {
        if ("mfaVerified" in session) token.mfaVerified = Boolean(session.mfaVerified);
      }
      if (token.sub) {
        const db = getDb();
        if (db) {
          const [profile] = await db
            .select({
              role: schema.profiles.role,
              totpEnabled: schema.profiles.totpEnabled,
              fullName: schema.profiles.fullName,
            })
            .from(schema.profiles)
            .where(eq(schema.profiles.id, token.sub))
            .limit(1);
          if (profile) {
            token.role = profile.role;
            token.totpEnabled = profile.totpEnabled;
            token.name = profile.fullName || token.name;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as "cliente" | "abogado" | "admin") ?? "cliente";
        session.user.totpEnabled = Boolean(token.totpEnabled);
        session.user.mfaVerified = Boolean(token.mfaVerified);
      }
      return session;
    },
  },
  trustHost: true,
  secret: env.AUTH_SECRET,
} satisfies NextAuthConfig;

export function createAuthAdapter() {
  const db = getDb();
  if (!db) return undefined;
  return DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  });
}
