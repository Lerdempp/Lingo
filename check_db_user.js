const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://erdem:alierdem123@cluster0.ubuow5m.mongodb.net/lingo?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(); // This is the 'lingo' database specified in URI
    // Check if the user exists with any casing
    const users = await db.collection("users").find({ username: { $regex: /^alierdem$/i } }).toArray();
    console.log("Found users (case-insensitive search):", users.map(u => ({ username: u.username, _id: u._id })));
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
