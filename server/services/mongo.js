const mongoose = require("mongoose");
require("dotenv").config();

const { MONGO_PW, MONGO_USERNAME } = process.env;
const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PW}@nasacuster.qvnvqnx.mongodb.net/nasa?retryWrites=true&w=majority`;

mongoose.connection.once("open", () => {
  console.log("MongoDB connection ready!");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

module.exports = {
  mongoConnect,
};
