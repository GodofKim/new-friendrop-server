const express = require('express');
const router = express.Router();
/* Authentication */
const Authentication = require('../controllers/authentication');
const passportService = require('../services/passport');
const passport = require('passport');
const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false});
/* Models */
const User = require('../models/user');
const Profile = require('../models/profile');
const Drop = require('../models/drop');
const Letter = require('../models/letter');
const Contact = require('../models/contact');

/* APIs */
router.post('/signup', Authentication.signup);

router.post('/signin', requireSignin, Authentication.signin);

router.delete('/', requireAuth, (req, res, next) => {
  const email = req.user.email;

  Contact.remove({email})
  .then(() => Letter.remove({email}), (err) => next(err) )
  .then(() => Drop.remove({email}), (err) => next(err) )
  .then(() => Profile.remove({email}), (err) => next(err) )
  .then(() => User.remove({email}), (err) => next(err))
  .then(() => {
    res.status(200);
    res.send('User info deleted.');
  }, (err) => {
    next(err);
  });
});

module.exports = router;
