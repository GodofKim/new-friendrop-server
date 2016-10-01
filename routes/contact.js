const express = require('express');
const router = express.Router();

const async = require('async');
const mongoose = require('mongoose');

const User = require('../models/user');
const Profile = require('../models/profile');
const Contact = require('../models/contact');
const passport = require('passport');
const requireAuth = passport.authenticate('jwt', { session: false });

router.get('/', requireAuth, (req, res) => {
  Contact.find({ host: req.user._id })
  .sort({"_id": -1})
  .limit(6)
  .exec((err, contacts) => {
    if(err) throw err;

    contacts = JSON.parse(JSON.stringify(contacts));
    console.log(contacts);

    var contactsToSend = [];
    // 1st para in async.each() is the array of items
    async.each(contacts,
      // 2nd param is the function that each item is passed to
      function(contact, callback){
        // Call an asynchronous function, often a save() to DB
        Profile.find({email: contact.email}, function (err, profile){
          if(err) throw err;

          profile = profile[0];

          contactsToSend.push({
            _id: contact._id,
            email: profile.email,
            name: profile.name,
            nickname: profile.nickname,
            phone: profile.phone,
            date: contact.date
          });

          // Async call is done, alert via callback
          callback();
        });
      },
      // 3rd param is the function to call when everything's done
      function(err){
        // All tasks are done now
        console.log(contactsToSend);
        return res.json(contactsToSend);
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
    Contact.find({ host: req.user._id, _id: { $gt: objId }})
    .sort({"_id": -1})
    .limit(6)
    .exec((err, contacts) => {
      if(err) throw err;

      var contactsToSend = [];
      async.each(
        contacts,
        (contact, callback) => {
          Profile.find({email: contact.email}, (err, profile) => {
            if(err) throw err;
            profile = profile[0];

            contactsToSend.push({
              _id: contact._id,
              email: profile.email,
              name: profile.name,
              nickname: profile.nickname,
              phone: profile.phone,
              date: contact.date
            });
            callback();

          });
        },
        (err) => {
          // All tasks are done now
            console.log(contactsToSend);
            return res.json(contactsToSend);
        });
    });
  }
  else
  {
    Contact.find({ host: req.user._id, _id: { $lt: objId }})
    .sort({"_id": -1})
    .limit(6)
    .exec((err, contacts) => {
      if(err) throw err;

      var contactsToSend = [];
      async.each(
        contacts,
        (contact, callback) => {
          Profile.find({email: contact.email}, (err, profile) => {
            if(err) throw err;
            profile = profile[0];

            contactsToSend.push({
              _id: contact._id,
              email: profile.email,
              name: profile.name,
              nickname: profile.nickname,
              phone: profile.phone,
              date: contact.date
            });
            callback();

          });
        },
        (err) => {
          // All tasks are done now
            console.log(contactsToSend);
            return res.json(contactsToSend);
        });
    });
  }
}); // router.get('/:listType/:id', requireAuth, (req, res)=>{} );


router.post ('/', requireAuth, function (req, res, next) {
  const receiver = req.body.receiver;

  User.findOne({email: receiver}, (err, receiver) => {
    if(err) { return next(err);}

    if(!receiver){
      res.status(404);
      res.send("Receiver not found");
    }else{
      const contact = new Contact({
        host: receiver._id,
        email: req.user.email, // 보낸 사람.
        date: Date.now()
      });

      Contact.findOne({ host: contact.host, email: contact.email}, (err, isExist) => {
        if(isExist){
          res.send("already exists."); // 일단 여기서 끝내고 나중에 클라이언트로 알림 뜨게 만들어라.
        }else{
          contact.save((err) =>{
            if(err) { return next(err);}

            console.log('contact sent!');
            res.status(200);
            res.send({ message: 'success'});
          });
        }
      });
    }
  });
});


module.exports = router;
