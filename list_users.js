const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://erdem:alierdem123@cluster0.ubuow5m.mongodb.net/lingo?retryWrites=true&w=majority&appName=Cluster0";

async function listUsers() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const users = await db.collection("users").find({}).project({ passwordHash: 0 }).toArray();
    
    console.log("\n=== KAYITLI KULLANICILAR ===\n");
    if (users.length === 0) {
      console.log("Henüz kayıtlı kullanıcı bulunmuyor.");
    } else {
      users.forEach((user, i) => {
        console.log(`${i+1}. [${user.username}] - Kayıt Tarihi: ${user.createdAt || 'Bilinmiyor'}`);
      });
    }
    console.log("\n============================\n");
  } catch (error) {
    console.error("Hata:", error.message);
  } finally {
    await client.close();
  }
}

listUsers();
