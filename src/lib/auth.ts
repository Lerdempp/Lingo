import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // adapter: MongoDBAdapter(clientPromise),
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log("--- Authorize START ---");
        console.log("Credentials:", credentials);
        const { username, password, switchKey } = credentials as any;

        if (!username) {
          console.log("Error: No username");
          return null;
        }
        
        try {
          console.log("Connecting to DB...");
          const client = await clientPromise;
          const db = client.db();
          console.log("Fetching user from DB:", username);
          const user = await db.collection("users").findOne({ username });
          
          if (!user) {
            console.log("Error: User not found");
            return null;
          }

          console.log("User found, processing auth...");
          // Try password login
          if (password) {
            console.log("Checking password...");
            const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
            console.log("Password match:", passwordsMatch);
            if (passwordsMatch) {
              return { 
                id: user._id.toString(), 
                name: user.username,
                email: `${user.username}@lingo.app` // Adding dummy email to satisfy some NextAuth versions
              };
            }
          }

          // Try Switch Key login (One-tap)
          if (switchKey) {
            console.log("Checking switchKey...");
            const deviceTickets = user.switchTickets || [];
            const validTicket = deviceTickets.find((t: any) => t.key === switchKey);
            
            if (validTicket) {
              const isExpired = Date.now() - new Date(validTicket.createdAt).getTime() > 30 * 24 * 60 * 60 * 1000;
              if (!isExpired) {
                console.log("SwitchKey valid and not expired");
                return { 
                  id: user._id.toString(), 
                  name: user.username,
                  email: `${user.username}@lingo.app` 
                };
              } else {
                console.log("SwitchKey expired");
              }
            } else {
              console.log("SwitchKey invalid");
            }
          }
        } catch (dbError: any) {
          console.error("DATABASE ERROR in authorize:", dbError);
          // Don't return null if it's a DB error, let it propagate or throw to show better error
          throw new Error("Database connection failed during login");
        }

        console.log("Authorize FAILED - returning null");
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt"
  },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      // In some NextAuth v5 versions, request might not have nextUrl directly
      const nextUrl = request?.nextUrl;
      const isLoggedIn = !!auth?.user;
      
      console.log("Authorized callback:", { isLoggedIn, path: nextUrl?.pathname });

      if (nextUrl?.pathname.startsWith("/api")) {
        if (!isLoggedIn && !nextUrl.pathname.startsWith("/api/auth")) {
          // Allow internal API call for registration etc
          if (nextUrl.pathname.startsWith("/api/register")) return true;
          return false;
        }
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        console.log("JWT callback - user added to token:", user.id);
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        console.log("Session callback - token id added to session:", token.id);
      }
      return session;
    },
  },
});

