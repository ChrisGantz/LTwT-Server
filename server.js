'use strict';
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const { PORT, CLIENT_ORIGIN, MONGODB_URI } = require('./config');
// user authentication
const passport = require('passport');
const { localStrategy, jwtStrategy } = require('./passport/strategies');
// routes

const app = express();

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);
// add whenever route needs to be authenticated
const jwtAuth = passport.authenticate('jwt', {
  session: false,
  failWithError: true
});
// this used to be appp.use(bodyParser.json())
app.use(express.json());

// passport
passport.use(localStrategy);
passport.use(jwtStrategy);

// Mount Routers


// error handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(MONGODB_URI)
    .then(instance => {
      const conn = instance.connections[0];
      console.info(
        `Connected to: mongodb://${conn.host}:${conn.port}/${conn.name}`
      );
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error('\n === Did you remember to start `mongod`? === \n');
      console.error(err);
    });
  app
    .listen(PORT, function () {
      console.info(`Server listening on ${this.address().port}`);
    })
    .on('error', err => {
      console.error(err);
    });
}

module.exports = app;
