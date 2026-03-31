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

  const words = await db.collection("words")
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  // Convert MongoDB _id to id string for frontend compatibility if needed, 
  // though we kept "id" as a separate string field earlier. 
  // Let's ensure the frontend gets what it expects.
  return NextResponse.json({ words });
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json();
  const client = await clientPromise;
  const db = client.db();

  // If sync (bulk update)
  if (Array.isArray(body)) {
    const words = body;
    
    if (words.length === 0) {
      return NextResponse.json({ message: "Empty sync" });
    }

    const operations = words.map((w) => ({
      updateOne: {
        filter: { id: w.id, userId },
        update: {
          $set: {
            original: w.original,
            translation: w.translation,
            exampleSentence: w.exampleSentence,
            correctAnswers: w.correctAnswers || 0,
            wrongAnswers: w.wrongAnswers || 0,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            id: w.id,
            userId,
            createdAt: new Date(w.createdAt || Date.now()),
          }
        },
        upsert: true,
      },
    }));

    await db.collection("words").bulkWrite(operations);
    return NextResponse.json({ message: "Sync successful" });
  }

  // Single word create
  const { original, translation, exampleSentence, id } = body;
  const newWord = {
    id: id || Math.random().toString(36).substring(7),
    userId,
    original,
    translation,
    exampleSentence,
    correctAnswers: 0,
    wrongAnswers: 0,
    createdAt: new Date(),
  };

  await db.collection("words").insertOne(newWord);

  return NextResponse.json({ word: newWord });
}

export async function DELETE(req: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();

  await db.collection("words").deleteOne({ 
    id, 
    userId: (session.user as any).id 
  });

  return NextResponse.json({ message: "Word deleted" });
}

export async function PUT(req: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, isCorrect } = body;

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();

  const update = isCorrect 
    ? { $inc: { correctAnswers: 1 } } 
    : { $inc: { wrongAnswers: 1 } };

  const result = await db.collection("words").findOneAndUpdate(
    { id, userId: (session.user as any).id },
    update,
    { returnDocument: "after" }
  );

  return NextResponse.json({ word: result });
}

