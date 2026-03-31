const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const uri = "mongodb+srv://erdem:alierdem123@cluster0.ubuow5m.mongodb.net/lingo?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const username = "alierdem";
    const newPassword = "alierdem123";
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await db.collection("users").updateOne(
      { username },
      { $set: { passwordHash: hashedPassword } }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`Password for user '${username}' has been successfully reset to '${newPassword}'.`);
    } else {
      console.log(`User '${username}' not found or password was already identical.`);
    }
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
