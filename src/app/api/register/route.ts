import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import clientPromise from "@/lib/mongodb";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const MAX_SIGNUPS_PER_IP = 100;
const COOLDOWN_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const client = await clientPromise;
    const db = client.db();

    // Simple Rate Limiting check
    let limit = await db.collection("signupLimits").findOne({ ip });

    if (limit) {
      const isStillInCooldown = Date.now() - new Date(limit.lastDate).getTime() < COOLDOWN_PERIOD_MS;
      if (isStillInCooldown && limit.count >= MAX_SIGNUPS_PER_IP) {
        return NextResponse.json(
          { error: "Too many accounts created from this IP. Please try again tomorrow." },
          { status: 429 }
        );
      }

      // Reset count if cooldown passed
      if (!isStillInCooldown) {
        await db.collection("signupLimits").updateOne(
          { ip },
          { $set: { count: 1, lastDate: new Date() } }
        );
      } else {
        await db.collection("signupLimits").updateOne(
          { ip },
          { $inc: { count: 1 } }
        );
      }
    } else {
      await db.collection("signupLimits").insertOne({
        ip,
        count: 1,
        lastDate: new Date(),
      });
    }

    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { username, password } = result.data;

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ username });

    if (existingUser) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await db.collection("users").insertOne({
      username,
      passwordHash: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: userResult.insertedId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

