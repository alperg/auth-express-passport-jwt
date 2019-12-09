// Reads in configuration from a .env file
require('dotenv').config(); 

const express = require('express');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();
const port = process.env.PORT || 7777;
const dbUrl = process.env.DB_URL || 'localhost';
const dbCollection = process.env.DB_COLLECTION || 'auth-test';

// Fixes an issue with a deprecated default in Mongoose.js
mongoose.set('useCreateIndex', true);

mongoose.connect(`mongodb://${dbUrl}/${dbCollection}`, {useNewUrlParser: true, useUnifiedTopology: true })
  .then(_ => console.log('Connected Successfully to MongoDB'))
  .catch(err => console.error('Connection error: ', err));

// Imports our configuration file which holds our verification callbacks and things like the secret for signing.
require('./passport-config')(passport);

// Middlewares
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressSession({
  secret: process.env.SECRET || 'this is the default passphrase',
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: false
}));

// Initializes the passport configuration
app.use(passport.initialize());
app.use(passport.session());

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

app.get('/auth-test1', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ success: true, user: req.user });
});

app.get('/auth-test2', passport.authenticate('jwt', { session: false }), (req, res) => {
  const allowedRoles = ['student'];

  if (!allowedRoles.includes(req.user.role)) {
    return res.json({ success: false, message: 'You are not allowed to do this action!' });
  }
  return res.json({ success: true, user: req.user });
});

const acl = require('./acl.js');

app.get('/auth-test3', acl.checkRoles(['admin'], passport, 'jwt', { session: false }), (req, res, next) => {
  console.log('here');
  res.json({ haha: 'hahahaha'});
});

app.get('/auth-test4', passport.authenticate('jwt', { session: false }), acl.checkRoles2, (req, res, next) => {
  console.log('here');
  res.json({ haha: 'hakkahkahahahaha'});
});

app.listen(port, err => {
  if(err) console.error(err);
  console.log(`Listening for Requests on port: ${port}`);
});
