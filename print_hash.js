const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://erdem:alierdem123@cluster0.ubuow5m.mongodb.net/lingo?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const user = await db.collection("users").findOne({ username: "alierdem" });
    console.log("Hash in DB:", user.passwordHash);
  } finally {
    await client.close();
  }
}
run();
