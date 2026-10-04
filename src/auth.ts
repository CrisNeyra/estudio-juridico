import NextAuth from "next-auth";
import { authConfig, createAuthAdapter } from "@/lib/auth-config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: createAuthAdapter(),
});
