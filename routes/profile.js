const express = require('express');
const router = express.Router();
/* Models */
const Profile = require('../models/profile');
/* Authentication */
import { requireAuth } from './users';

/* APIs */
router.get('/', requireAuth, (req, res, next) => {
  Profile.findOne({host: req.user._id}, (err, profile) => {
    if (err) return next(err);

    let profileObject = JSON.parse(JSON.stringify(profile));
    res.json({ profiile: profileObject });
  });
});

router.put('/', requireAuth, (req, res, next) => {
  Profile.update({ host: req.user._id},
  {
    $set: {
      "name": req.body.name,
      "nickname": req.body.nickname,
      "school": req.body.school,
      "major": req.body.major,
      "phone": req.body.phone
    }
  }, (err) => {
    if(err) res.status(422).send({ error: 'profile edit failed.'});

    res.status(200);
    res.send('profile edit success');
  });
});

router.get('/:email', (req, res, next) => {
  Profile.findOne({ email: req.params.email}, (err, profile) => {
    if(err) return next(err);
    if(!profile) {
      res.status(404).send({ error: "User doesn't exist"});
    }
    else {
      // protected 에 있는 것은 지우고 보내도록 업데이트 하시오.
      let profileObject = JSON.parse(JSON.stringify(profile));
      res.json({profile: profileObject});
    }
  });
});

module.exports = router;
