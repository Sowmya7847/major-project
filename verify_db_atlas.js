require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

if (!uri || uri.includes('<username>')) {
  console.error('❌ Error: MONGO_URI is not set correctly in .env');
  process.exit(1);
}

console.log('Connecting to MongoDB Atlas...');
mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });
