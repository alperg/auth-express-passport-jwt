// Reads in configuration from a .env file
require('dotenv').config(); 

const express = require('express');
const cp = require('cookie-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const app = express();
const port = process.env.PORT || 7777;
const dbPort = process.env.DB_PORT || 27017;
const dbUrl = process.env.DB_URL || 'localhost';
const dbCollection = process.env.DB_COLLECTION || 'auth-test';

// Fixes an issue with a deprecated default in Mongoose.js
mongoose.set('useCreateIndex', true);

mongoose.connect(`mongodb://${dbUrl}/${dbCollection}`, {useNewUrlParser: true})
  .then(_ => console.log('Connected Successfully to MongoDB'))
  .catch(err => console.error(err));

// Initializes the passport configuration
app.use(passport.initialize());

// Imports our configuration file which holds our verification callbacks and things like the secret for signing.
require('./passport-config')(passport);

app.use(cp());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Custom Middleware for logging the each request going to the API
app.use((req, res, next) => {
  if (req.body) {
    console.info(req.body);
  }
  if (req.params) {
    console.info(req.params);
  }
  if(req.query) {
    console.info(req.query);
  }
  console.info(`Received a ${req.method} request from ${req.ip} for ${req.url}`);
  next();
});

// Registers our authentication routes with Express.
app.use('/users', require('./routes/user.js'));

app.use('/auth-test', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ success: true });
});

app.listen(port, err => {
  if(err) console.error(err);
  console.log(`Listening for Requests on port: ${port}`);
});
