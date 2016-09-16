const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Profile = require('../models/profile');
const Contact = require('../models/contact');
const passport = require('passport');
const requireAuth = passport.authenticate('jwt', { session: false });


router.get('/', requireAuth, (req, res, next) => {
  Contact.find({host: req.user._id}, (err, contacts) => {
    if(err) throw err;

    var fetchData = JSON.parse(JSON.stringify(contacts));
    var sendArray = [];
    var times = fetchData.length;
    var i = 0;

    fetchData.forEach((contact) => {
      Profile.findOne({email: contact.email}, (err, profile) => {
        var fetchProfile = JSON.parse(JSON.stringify(profile));

        sendArray[i] = {
          _id: contact._id,
          email: fetchProfile.email,
          name: fetchProfile.name,
          nickname: fetchProfile.nickname,
          phone: fetchProfile.phone,
          date: contact.date
        };

        i ++;
        if( i == times ){
          res.json({contacts: sendArray});
        }
      });
    });
  });
});

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
