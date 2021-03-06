var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var OAuth2Strategy = require('passport-cognito-oauth2');
var { User } = require('./model/schema');
var jwt = require('jsonwebtoken');
var expressSession = require('express-session')

/*------------------------*/

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use('oauth2', new OAuth2Strategy({  
  clientDomain: process.env.CLIENT_DOMAIN,
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3001/auth/callback/",
  region: process.env.AWS_REGION
},
  function (accessToken, refreshToken, params, profile, cb) {
    console.log(params);
    console.log(profile);    
    var decoded = jwt.decode(accessToken); 

    User.findOrCreate({ _id: decoded.sub }, { accessToken, refreshToken }, function (err, user) {
      if(err) return cb(err);

      user.accessToken = accessToken;
      user.refreshToken = refreshToken;

      return user.save(()=> cb(err, user));
    });
  }
));

const session = {
  secret: process.env.SESSION_SECRET,
  cookie: {},
  resave: false,
  saveUninitialized: false
};

/*------------------------*/

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var homeRouter = require('./routes/home');
const { access } = require('fs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(expressSession(session));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/home', homeRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
