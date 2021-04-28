var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth2');
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

passport.use(new OAuth2Strategy({
  authorizationURL: 'https://tbdc-idp.auth.us-east-1.amazoncognito.com/oauth2/authorize',
  tokenURL: 'https://tbdc-idp.auth.us-east-1.amazoncognito.com/oauth2/token',
  clientID: '5fkalbmtcajkma6h4kvkufnuor',
  clientSecret: '1ujgfoopg99km509d9rrvs1egnqmcuavq8e8o6c5o5kf51qlvn43',
  callbackURL: "http://localhost:3001/auth/callback/"
},
  function (accessToken, refreshToken, profile, cb) {    
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
