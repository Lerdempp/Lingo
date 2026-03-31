const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const uri = "mongodb+srv://erdem:alierdem123@cluster0.ubuow5m.mongodb.net/lingo?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const username = "alierdem";
    const user = await db.collection("users").findOne({ username });
    if (user) {
      console.log("User found:", user.username);
      const isMatch = await bcrypt.compare("alierdem123", user.passwordHash);
      console.log("Password match (alierdem123):", isMatch);
    } else {
      console.log("User not found");
    }
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
