const express = require('express');
const router = express.Router();

const async = require('async');

const Profile = require('../models/profile');
const Drop = require('../models/drop');
const passport = require('passport');
const requireAuth = passport.authenticate('jwt', { session: false });

/* APIs */

/*
READ MEMO: GET /api/memo
*/
router.get('/', requireAuth, (req, res) => {
  Drop.find({ host: req.user._id })
  .sort({"_id": -1})
  .limit(6)
  .exec((err, drops) => {
    if(err) throw err;

    drops = JSON.parse(JSON.stringify(drops));
    console.log(drops);

    var dropsToSend = [];
    // 1st para in async.each() is the array of items
    async.each(drops,
      // 2nd param is the function that each item is passed to
      function(drop, callback){
        // Call an asynchronous function, often a save() to DB
        Profile.find({email: drop.email}, function (err, profile){
          if(err) throw err;

          profile = profile[0];

          dropsToSend.push({
            _id: drop._id, // for sorting, keying
            email: profile.email,
            name: profile.name,
            nickname: profile.nickname,
            gender: profile.gender,
            school: profile.school,
            major: profile.major,
            date: drop.date
          });

          // Async call is done, alert via callback
          callback();
        });
      },
      // 3rd param is the function to call when everything's done
      function(err){
        // All tasks are done now
        console.log(dropsToSend);
        return res.json(dropsToSend);
      }
    );
  });
});

/* READ ADDITIONAL OLD/NEW MEMO: GET /api/memo/:listType/:id */
router.get('/:listType/:id', requireAuth, (req, res) => {
  var listType = req.params.listType;
  var id = req.params.id;

  // CHECK LIST TYPE VALIDITY
  if(listType !== 'old' && listType !== 'new') {
    return res.status(400).json({
      error: "INVALID LISTTYPE",
      code: 1
    });
  }

  // CHECK MEMO ID VALIDITY
  if(!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: "INVALID ID",
      code: 2
    });
  }

  var objId = new mongoose.Types.ObjectId(req.params.id);

  if(listType === 'new'){
    // GET NEWER MEMO
    var dropsToSend = [];
    // 1st para in async.each() is the array of items
    async.each(drops,
      // 2nd param is the function that each item is passed to
      function(drop, callback){
        // Call an asynchronous function, often a save() to DB
        Profile.find({email: drop.email, _id: { $gt: objId }}, function (err, profile){
          if(err) throw err;

          profile = profile[0];

          dropsToSend.push({
            _id: drop._id, // for sorting, keying
            email: profile.email,
            name: profile.name,
            nickname: profile.nickname,
            gender: profile.gender,
            school: profile.school,
            major: profile.major,
            date: drop.date
          });

          // Async call is done, alert via callback
          callback();
        });
      },
      // 3rd param is the function to call when everything's done
      function(err){
        // All tasks are done now
        console.log(dropsToSend);
        return res.json(dropsToSend);
      }
    );
  } else {
    // GET OLDER MEMO
    var dropsToSend = [];
    // 1st para in async.each() is the array of items
    async.each(drops,
      // 2nd param is the function that each item is passed to
      function(drop, callback){
        // Call an asynchronous function, often a save() to DB
        Profile.find({email: drop.email, _id: { $lt: objId }}, function (err, profile){
          if(err) throw err;

          profile = profile[0];

          dropsToSend.push({
            _id: drop._id, // for sorting, keying
            email: profile.email,
            name: profile.name,
            nickname: profile.nickname,
            gender: profile.gender,
            school: profile.school,
            major: profile.major,
            date: drop.date
          });

          // Async call is done, alert via callback
          callback();
        });
      },
      // 3rd param is the function to call when everything's done
      function(err){
        // All tasks are done now
        console.log(dropsToSend);
        return res.json(dropsToSend);
      }
    );
  }
});

/*
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
*/

router.delete('/', function(req, res, next) {
  res.render('index', {title: 'exrpess'});
});

module.exports = router;
