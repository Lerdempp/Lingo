import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deviceId } = await req.json();
    if (!deviceId) {
      return NextResponse.json({ error: "Device ID required" }, { status: 400 });
    }

    const switchKey = crypto.randomBytes(32).toString("hex");
    const client = await clientPromise;
    const db = client.db();

    const username = session.user.name;

    // Remove existing ticket for this device to keep it clean
    await db.collection("users").updateOne(
      { username },
      { 
        $pull: { switchTickets: { deviceId } as any } 
      }
    );

    // Add new ticket
    await db.collection("users").updateOne(
      { username },
      { 
        $push: { 
          switchTickets: { 
            deviceId, 
            key: switchKey, 
            createdAt: new Date() 
          } as any 
        } 
      }
    );

    return NextResponse.json({ switchKey });
  } catch (err) {
    console.error("Switch ticket error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
