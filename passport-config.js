const { Strategy, ExtractJwt } = require('passport-jwt');
const User = require('./models/user');

const secret = process.env.SECRET || 'the default secret';
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret,
  passReqToCallback: true
};

// this sets how we handle tokens coming from the requests that come
// and also defines the key to be used when verifying the token.
module.exports = passport => {
  passport.use(
    new Strategy(jwtOptions, (req, payload, done) => {
      User.findById(payload.id)
        .then(user => {
          if(user) {
            req.user = {
              id: user.id,
              userName: user.userName,
              email: user.email,
              role: user.role
            };
            return done(null, req.user);
          }
          return done(null, false);
        })
        .catch(err => console.error(err));
    })
  );
};
