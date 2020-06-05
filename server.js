// Express is a standard server and API building framework for Node.js
const express = require("express");
// Morgan is a http request middleware logger for Node.js
const logger = require("morgan");
// Mongoose is used to interact with a mongoDB database. Mongoose allows easier reference to mongoDB data because it models out the db within your project code.
const mongoose = require("mongoose");
// The compression middleware will attempt to compress response bodies for all
// requests that traverse through the middleware, based on the given options.
const compression = require("compression");

const PORT = process.env.PORT || 3000;

const app = express();

// Morgan allows us to easily log requests, errors, and more to the console.
app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("./public"));

// Set up the mongoose connection the mongoDB database.
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/budget";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useFindAndModify: false
});

// Routes
app.use(require("./routes/api.js"));

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
