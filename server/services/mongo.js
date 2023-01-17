const mongoose = require('mongoose');
require('dotenv').config();

const { MONGO_PW, MONGO_USERNAME } = process.env;
const MONGO_URL = `mongodb+srv://nasa-api:${MONGO_PW}@nasacuster.qvnvqnx.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
