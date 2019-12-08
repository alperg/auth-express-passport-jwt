const { Strategy, ExtractJwt } = require('passport-jwt');
const secret = process.env.SECRET || 'the default secret';
const mongoose = require('mongoose');
const User = require('./models/user');
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret
};

//this sets how we handle tokens coming from the requests that come
// and also defines the key to be used when verifying the token.
module.exports = passport => {
  passport.use(
    new Strategy(opts, (payload, done) => {
      User.findById(payload.id)
        .then(user => {
          if(user) {
            return done(null, {
              id: user.id,
              userName: user.userName,
              email: user.email,
            });
          }
          return done(null, false);
        })
        .catch(err => console.error(err));
    })
  );
};
