const express = require('express');
const router = express.Router();
const async = require('async');
const mongoose = require('mongoose');

const User = require('../models/user');
const Profile = require('../models/profile');
const Letter = require('../models/letter');

const passport = require('passport');
const requireAuth = passport.authenticate('jwt', { session: false });

router.get('/', requireAuth, (req, res) => {
  Letter.find({ host: req.user._id })
  .sort({"_id": -1})
  .limit(6)
  .exec((err, letters) => {
    if(err) throw err;

    drops = JSON.parse(JSON.stringify(letters));

    var lettersToSend = [];
    // 1st para in async.each() is the array of items
    async.each(letters,
      // 2nd param is the function that each item is passed to
      function(letter, callback){
        // Call an asynchronous function, often a save() to DB
        Profile.findOne({email: letter.email}).exec((err, profile) => {
          if(err) throw err;

          lettersToSend.push({
            _id: letter._id,
            email: profile.email,
            name: profile.name,
            nickname: profile.nickname,
            content: letter.content,
            date: letter.date
          });

          // Async call is done, alert via callback
          callback();
        });
      },
      // 3rd param is the function to call when everything's done
      function(err){
        // All tasks are done now
        return res.json(lettersToSend);
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

  if(listType === 'new')
  {
    Letter.find({ host: req.user._id, _id: { $gt: objId }})
    .sort({"_id": -1})
    .limit(6)
    .exec((err, letters) => {
      if(err) throw err;

      var lettersToSend = [];
      async.each(
        letters,
        (letter, callback) => {
          Profile.findOne({email: letter.email}).exec((err, profile) => {
            if(err) throw err;

            lettersToSend.push({
              _id: letter._id,
              email: profile.email,
              name: profile.name,
              nickname: profile.nickname,
              content: letter.content,
              date: letter.date
            });
            callback();

          });
        },
        (err) => {
          // All tasks are done now
            return res.json(lettersToSend);
        });
    });
  }
  else
  {
    Letter.find({ host: req.user._id, _id: { $lt: objId }})
    .sort({"_id": -1})
    .limit(6)
    .exec((err, letters) => {
      if(err) throw err;

      var lettersToSend = [];
      async.each(
        letters,
        (letter, callback) => {
          Profile.findOne({email: letter.email}).exec((err, profile) => {
            if(err) throw err;

            lettersToSend.push({
              _id: letter._id,
              email: profile.email,
              name: profile.name,
              nickname: profile.nickname,
              content: letter.content,
              date: letter.date
            });
            callback();

          });
        },
        (err) => {
          // All tasks are done now
            return res.json(lettersToSend);
        });
    });
  }
}); // router.get('/:listType/:id', requireAuth, (req, res)=>{} );


router.post ('/', requireAuth, function (req, res, next) {
  const receiver = req.body.receiver;
  const content = req.body.content;

  User.findOne({email: receiver}, (err, receiver) => {
    if(err) { return next(err);}

    if(!receiver){
      res.status(404);
      res.send("Receiver not found");
    }else{
      const letter = new Letter({
        host: receiver._id,
        email: req.user.email, // 보낸 사람.
        content: content,
        date: Date.now()
      });

      letter.save((err) =>{
        if(err) { return next(err);}

        console.log('Letter sent!');
        res.status(200);
        res.send({message: 'success'});
      });
    }
  });
});

module.exports = router;
