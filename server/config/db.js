const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/veera_naturals';
  
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick fallback if local mongod is not up
    });
    isConnected = true;
    console.log(`🌿 [MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ [MongoDB Not Reachable]: ${error.message}`);
    console.log(`🚀 [Veera Naturals Storage]: Activating resilient Local Embedded Data Store at /server/data/store.json`);
    isConnected = false;
    return false;
  }
};

const getDBStatus = () => ({
  connected: isConnected,
  type: isConnected ? 'MongoDB (Mongoose)' : 'Local File Persistence Engine (JSON Store)',
});

module.exports = { connectDB, getDBStatus };
