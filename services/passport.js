const passport = require('passport');
/* Strategies */
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
/* Models */
const User = require('../models/user');
/* Config file */
const config = require('../controllers/config');

/* LOCAL STRATEGY */
// change default setting ( username => email )
const localOptions = { usernameField: 'email' };
const localLogin = new LocalStrategy(localOptions, function(email, password, done){
  // Verify this email and password, call done with the user if it is the correct email and password. otherwise, call done with FALSE.
  User.findOne({ email: email }, function(err, user) {
    if (err) return done(err);
    if (!user) return done(null, false);

    //compare passwords -> is 'password' equal to user.password? -> hashed!
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if (!isMatch) return done(null, false);

      return done(null, user);
    });
  });
});

/* JWT STRATEGY */
// Setup options for JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret
};

// Create JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  // See if the user email in the payload exists in our database.
  // If it does, call 'done' with that other.
  // Otherwise, call 'done' without a user object.

  User.findOne({ email: payload.sub }, function(err, user) {
    if (err) return done(err, false);

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

// Tell passport to use this strategies.
passport.use(localLogin);
passport.use(jwtLogin);
