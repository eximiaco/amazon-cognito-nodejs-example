var express = require('express');
var passport = require('passport');
var axios = require('axios');

var authorized = require('../auth/authorized');
var router = express.Router();

/* GET home page. */
router.get('/', authorized(''), function (req, res, next) {
  res.render('home', { title: 'TBDC' });
});

router.post('/', authorized(''), function (req, res, next) {
  axios.get(`${process.env.API_URI}`, {
    headers: {
      'Authorization': `Bearer ${req.user.accessToken}`
    }
  })
    .then((response) => {
      res.render('home', { title: 'TBDC', apiResponse: response.data });
    }, (error) => {
      console.log(error);
    });
});

module.exports = router;
