const express = require('express');
const router = express.Router();
/* Models */
const Profile = require('../models/profile');
/* Authentication */
const passport = require('passport');
const requireAuth = passport.authenticate('jwt', { session: false });
/* Multer for file upload */
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
/* AWS SDK */
var AWS = require('aws-sdk');
AWS.config.update({
  signatureVersion: 'v4',
  accessKeyId: "",
  secretAccessKey: ""
});
const s3 = new AWS.S3();
const fs = require('fs');


/* APIs */
router.get('/', requireAuth, (req, res, next) => {
  Profile.findOne({host: req.user._id}, (err, profile) => {
    if (err) return next(err);

    var profileObject = JSON.parse(JSON.stringify(profile));
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
      var profileObject = JSON.parse(JSON.stringify(profile));
      res.json({profile: profileObject});
    }
  });
});

router.post('/image', requireAuth, upload.single('image'), (req, res) => {
  Profile.findOne({ email: req.user.email }, (err, profile) => {
    if(err) return next(err);
    if(!profile){
      console.log("Find Profile Failed");
      res.status(404).send("Cannot find profile");
      return;
    }

    if(req.file){
      s3.upload({'Bucket':'friendrop',
        'Key':req.file.filename.toString(),
        'ACL':'public-read',
        'Body': fs.createReadStream(req.file.path),
        'ContentType':'image/png'},
        (err, data) => {
          if(err) throw err;
          fs.unlink(req.file.path);

          profile.update({$push : {image: req.file.filename}}, (err) => {
            if(err) next(err);
            console.log("Image Upload Success");

            res.status(200);
            res.send("Image Upload Success");
          });
      });
    }else{
      console.log("file doesn't exist.");
      res.send("file does't exist.");
    }
  });
});


module.exports = router;
