const jwt = require('jwt-simple');
/* Models */
const User = require('../models/user');
/* Config file */
const config = require('./config');


function tokenForUser (user) {
  const timestamp = new Date().getTime();

  return jwt.encode({ sub: user.email, iat: timestamp }, config.secret );
}

exports.signin = function(req, res, next) {
  res.send({ token: tokenForUser(req.user) });
};

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password) {
    return res.status(422)
    .send({ error: 'You must provide email and password'});
  }

  // See if a user with the given email exists
  User.findOne({ email: email }, function(err, existingUser){
    if (err) return next(err);

    // If a user with the email does exist, return an error
    if(existingUser) {
      return res.status(422).send({ error: 'Email is in use' });
    }

    // If a user with the email does NOT exist, create and save user record
    const user = new User({
      email: email,
      password: password
    });

    // save ( before saving , 'pre' method (in models/user.js) will be called)
    user.save(function(err) {
      if (err) return next(err);

      // make profile document in db/profile
      User.findOne({ email: email }, function(err, userDoc) {
        var profile = new Profile({
          host: userDoc._id,
          email: email,
          isInitiatied: false
        });

        profile.save(function(err) {
          if (err) return next(err);

          // Respond to request indicating the user was created
          res.json({ token: tokenForUser(user) });
        });
      });
    });
  });
};
