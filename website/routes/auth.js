var express = require('express');
var router = express.Router();
var passport = require('passport')

/* GET users listing. */
router.get('/login', passport.authenticate('oauth2'), function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/callback',
  passport.authenticate('oauth2', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home');
  });

module.exports = router;
