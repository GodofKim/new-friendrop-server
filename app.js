const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
/* Multer For Upload */
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
/* Routers */
const routes = require('./routes/index');
const users = require('./routes/users');
const profile = require('./routes/profile');
const drop = require('./routes/drop');
const letter = require('./routes/letter');
const contact = require('./routes/contact');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// DB setup
//mongoose.connect('');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* Routers */
app.use('/', routes);
app.use('/users', users);
app.use('/profile', profile);
app.use('/drop', drop);
app.use('/letter', letter);
app.use('/contact', contact);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Friendrop server is running at ', port);
});

module.exports = app;
