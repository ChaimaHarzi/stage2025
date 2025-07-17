console.log("NextAuth handler loaded");
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';
import { db } from "./db";
import Email from "next-auth/providers/email";



const authOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" as const },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize called", credentials);
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("Missing email or password in credentials");
            return null;
          }
          const user = await db.utilisateur.findUnique({
            where: { email: credentials.email },
          });
          if (!user) {
            console.error(`No user found for email: ${credentials.email}`);
            return null;
          }
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            console.error("Invalid password for email:", credentials.email);
            return null;
          }
          return {
            id: user.id,
            email: user.email,
          };
        } catch (error) {
          console.error("Error in authorize function:", error);
          return null;
        }
      }
    }),
  ],
};

export { authOptions };