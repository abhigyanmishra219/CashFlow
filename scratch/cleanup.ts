import mongoose from "mongoose";

async function cleanup() {
  await mongoose.connect('mongodb+srv://syncforgesolutions_db_user:MySecurePassword12@cluster0.jq4axfo.mongodb.net/syncforge_db?retryWrites=true&w=majority&appName=Cluster0');
  const db = mongoose.connection;
  const dummyNames = ['John Doe', 'Priya Sharma', 'Aman Gupta'];
  
  await db.collection('admissions').deleteMany({ fullName: { $in: dummyNames } });
  await db.collection('payments').deleteMany({ studentName: { $in: dummyNames } });
  
  console.log('Deleted dummy records successfully.');
  process.exit(0);
}

cleanup().catch(console.error);
