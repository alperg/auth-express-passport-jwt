module.exports = {
  checkRoles: function(roles, passport, strategy, options) {
    return function(req, res, next) {
      passport.authenticate(strategy, options, function(err, user, info) {
        if(err) {
          res.status(403).send('forbidden');
        } else if(!user) {
          res.status(403).send('forbidden');
        } else {
          if(roles.length === 0) {
            next();
          } else if(roles.includes(user.role)) {
            next();
          }
          else {
            res.status(403).send('forbidden');
          }
        }
      });
    }
  },
  checkRoles2: (req, res, next) =>  {
    if(req.user && req.user.role !== 'adminn') {
      res.status(403).json({ success: false });
    } else {
      next();
    }
  }
};
