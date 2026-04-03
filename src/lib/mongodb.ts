import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL || "";
const options = {};

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  // During build or if missing, provide a "pending" promise that won't crash the build
  // but will throw a helpful error if it's actually used at runtime.
  clientPromise = new Promise((_, reject) => {
    if (process.env.NODE_ENV === "production" && typeof window === "undefined") {
        const errorMsg = '⚠️ DATABASE_URL is missing in environment variables. DB operations will fail.';
        console.error(errorMsg);
        reject(new Error(errorMsg));
    } else {
        reject(new Error("DATABASE_URL is missing"));
    }
  });
} else {
  if (process.env.NODE_ENV === "development") {
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;
