import type { DefaultSession } from "next-auth";

export type Role = "ADMIN" | "OUVRIER";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    accessToken: string;
  }

  interface Session {
    accessToken: string;
    user: DefaultSession["user"] & { id: string; role: Role };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    accessToken: string;
  }
}
