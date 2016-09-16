const express = require('express');
const router = express.Router();

const Drop = require('../models/drop');
import { requireAuth } from './users';

/* APIs */
// 일단 이렇게 하고.. 나중에 더 좋은 방법을 찾아보자.
router.get('/', requireAuth, (req, res, next) => {
  Drop.find({ host: req.user._id}, (err, drops) => {
    if (err) return next(err);

    var fetchData = JSON.parse(JSON.stringify(drops));
    var sendArray = [];
    var times = fetchData.length;
    var i = 0;

    fetchData.forEach((drop) => {
      Profile.findOne({email: drop.email}, (err, profile) => {
        var fetchProfile = JSON.parse(JSON.stringify(profile));

        sendArray[i] = {
          _id: drop._id,
          email: fetchProfile.email,
          name: fetchProfile.name,
          nickname: fetchProfile.nickname,
          gender: fetchProfile.gender,
          school: fetchProfile.school,
          major: fetchProfile.major,
          date: drop.date
        };

        i ++;
        if( i == times ){
          res.json({drops: sendArray});
        }
      });
    });
  });
});

router.delete('/', function(req, res, next) {
  res.render('index', {title: 'exrpess'});
});

module.exports = router;
