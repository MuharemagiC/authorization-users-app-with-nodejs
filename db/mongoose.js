const mongoose = require("mongoose");
//require("dotenv").config();

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useFindAndModify: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

module.exports = mongoose;
