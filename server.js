const express = require("express");
// Morgan is a http request middleware logger for Node.js
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");
// The middleware will attempt to compress response bodies for all
// requests that traverse through the middleware, based on the given options.

const PORT = process.env.PORT || 3000;

const app = express();

// Morgan allows us to easily log requests, errors, and more to the console.
app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("./public"));

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
