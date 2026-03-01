const mongoose = require('mongoose');

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return mongoose.connection;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    return null;
  }

  await mongoose.connect(uri);
  isConnected = true;
  return mongoose.connection;
}

module.exports = { connectToDatabase };
