'use strict';

const { Strategy: LocalStrategy } = require('passport-local');

const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

// require user model
const {User} = require('');
const { JWT_SECRET } = require('../config');

const localStrategy = new LocalStrategy((username, password, callback) => {
  let user;
  User.findOne({ username: username })
    .then(_user => {
      user = _user;
      if (!user) {
        // return reject end promise here
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password'
        });
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if(!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password'
        })
      }
      return callback(null, user);
    })
    .catch(err => {
      if(err.reason === 'LoginError') {
        return callback(null, false, err);
      }
      return callback(err, false);
    });
});

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    // look for auth bearer in header
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    // only allow tokens with same hashing algorithm
    algorithms: ['HS256']
  },
  (payload, done) => {done(null, payload.user);}
);

module.exports = { localStrategy, jwtStrategy };