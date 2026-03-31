import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const client = await clientPromise;
  const db = client.db();

  const user = await db.collection("users").findOne({ username: session.user.name });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: user.displayName || user.username,
    avatarUrl: user.avatarUrl || "",
    email: user.email || "",
    phone: user.phone || "",
  });
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, avatarUrl, email, phone } = await req.json();
  const client = await clientPromise;
  const db = client.db();

  await db.collection("users").updateOne(
    { username: session.user.name },
    {
      $set: {
        displayName: name,
        avatarUrl: avatarUrl,
        email: email,
        phone: phone,
        updatedAt: new Date(),
      },
    }
  );


  return NextResponse.json({ message: "Profile updated successfully" });
}
