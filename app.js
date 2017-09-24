const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const api = require('./routes/api');
const authenticate = require('./routes/authenticate')(passport);
const mongoose = require('mongoose');
// setup mongodb connection
mongoose.connect("mongodb://localhost:27017/chirp-test");
require('./models/models')
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(session({
  secret:'super duper secret'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authenticate);
app.use('/api', api);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
var initPassport = require('./passport-init');
initPassport(passport);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
