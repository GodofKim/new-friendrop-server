const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Profile = require('../models/profile');
const Letter = require('../models/letter');

const passport = require('passport');
const requireAuth = passport.authenticate('jwt', { session: false });


router.get('/', requireAuth, (req, res, next) => {
  Letter.find({host: req.user._id}, (err, letters) => {
    if(err) return next(err);

    var fetchData = JSON.parse(JSON.stringify(letters));
    var sendArray = [];
    var times = fetchData.length;
    var i = 0;

    fetchData.forEach((letter) => {
      Profile.findOne({email: letter.email}, (err, profile) => {
        var fetchProfile = JSON.parse(JSON.stringify(profile));

        sendArray[i] = {
          _id: letter._id,
          email: fetchProfile.email,
          name: fetchProfile.name,
          nickname: fetchProfile.nickname,
          content: letter.content,
          date: letter.date
        };

        i ++;
        if( i == times ){
          res.json({letters: sendArray}); // ---- 이 방법이 맘에들지 않는다면 요청/응답을 두번에 걸쳐서 하는 방법도 있다.
        }
      });
    });
  });
});

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
