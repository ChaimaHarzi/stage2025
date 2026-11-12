import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { API_URL } from "./lib/config";

/** Durée de session alignée sur la durée du JWT de l'API (JWT_EXPIRES_IN = 8h). */
const SESSION_MAX_AGE = 8 * 60 * 60;

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      utilisateur { id email nom prenom role }
    }
  }
`;

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE },
  pages: { signIn: "/" },
  logger: {
    error(code, metadata) {
      // Cookie de session chiffré avec un ancien NEXTAUTH_SECRET : NextAuth l'ignore déjà
      // (l'utilisateur est simplement considéré comme déconnecté). Inutile d'afficher une erreur.
      if (code === "JWT_SESSION_ERROR") return;
      console.error(`[next-auth][${code}]`, metadata);
    },
    warn(code) {
      if (process.env.NODE_ENV !== "production") console.warn(`[next-auth][${code}]`);
    },
  },
  providers: [
    Credentials({
      name: "Identifiants",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      // L'API vérifie le mot de passe (Argon2) et délivre le JWT utilisé pour tous les appels.
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: LOGIN_MUTATION,
            variables: { input: { email: credentials.email, password: credentials.password } },
          }),
        });
        const json = await res.json().catch(() => null);
        const login = json?.data?.login;
        if (!login) {
          // Le message est transmis au formulaire via result.error.
          throw new Error(json?.errors?.[0]?.message ?? "Connexion impossible, veuillez réessayer.");
        }
        const u = login.utilisateur;
        return {
          id: u.id,
          email: u.email,
          name: [u.prenom, u.nom].filter(Boolean).join(" ") || u.email,
          role: u.role,
          accessToken: login.accessToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      // Mise à jour du nom affiché après modification du profil (useSession().update).
      if (trigger === "update" && typeof session?.name === "string") token.name = session.name;
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
