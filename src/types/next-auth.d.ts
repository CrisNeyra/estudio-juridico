import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "cliente" | "abogado" | "admin";
      totpEnabled: boolean;
      mfaVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "cliente" | "abogado" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "cliente" | "abogado" | "admin";
    totpEnabled?: boolean;
    mfaVerified?: boolean;
  }
}
