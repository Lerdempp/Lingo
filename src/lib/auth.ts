import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Credentials({
      async authorize(credentials) {
        const { username, password, switchKey } = credentials as any;

        if (!username) return null;
        
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection("users").findOne({ username });
        
        if (!user) return null;

        // Try password login
        if (password) {
          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
          if (passwordsMatch) {
            return { id: user._id.toString(), name: user.username };
          }
        }

        // Try Switch Key login (One-tap)
        if (switchKey) {
          const deviceTickets = user.switchTickets || [];
          const validTicket = deviceTickets.find((t: any) => t.key === switchKey);
          
          if (validTicket) {
            // Check expiry (e.g., 30 days)
            const isExpired = Date.now() - new Date(validTicket.createdAt).getTime() > 30 * 24 * 60 * 60 * 1000;
            if (!isExpired) {
              return { id: user._id.toString(), name: user.username };
            }
          }
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isApiRoute = nextUrl.pathname.startsWith("/api");

      if (isApiRoute && !isLoggedIn && !nextUrl.pathname.startsWith("/api/auth")) {
          // Allow internal API call for registration etc
          if (nextUrl.pathname.startsWith("/api/register")) return true;
          return false;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
});

