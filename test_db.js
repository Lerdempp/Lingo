const Database = require('better-sqlite3');
try {
  const db = new Database('dev.db');
  console.log('Database connected successfully');
  const result = db.prepare('SELECT 1').get();
  console.log('Test query result:', result);
  db.close();
} catch (e) {
  console.error('Database connection failed:', e);
}
