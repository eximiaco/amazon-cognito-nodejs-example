const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const app = express();
const port = process.env.PORT || 3000;
const { User } = require('./model/schema');

var mongoose = require('mongoose');
mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });

var client = jwksClient({
  jwksUri: `${process.env.COGNITO_ENDPOINT}/.well-known/jwks.json`
});

var JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;

var opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  algorithms: ['RS256'],
  secretOrKeyProvider: (request, rawJwtToken, done) => {
    const decoded = jwt.decode(rawJwtToken, {complete: true});
    client.getSigningKey(decoded.header.kid, function (err, key) {
      if (err) done(err);

      var signingKey = key.publicKey || key.rsaPublicKey;
      done(null, signingKey);
    });
  },
  issuer: process.env.COGNITO_ENDPOINT
};

passport.use('jwt', new JwtStrategy(opts, function (jwt_payload, cb) {
  User.findOrCreate({ _id: jwt_payload.sub }, function (err, user) {
    return cb(err, user, {scopes: jwt_payload.scope.split(' ')});
  });  
}));

app.use(passport.initialize());

const validateScope = (scope) => (req, res, next) => {
  if(!req.authInfo.scopes.includes(scope))
    return res.sendStatus(401);

    next();
};

app.get('/', passport.authenticate('jwt', { session: false }), validateScope(process.env.API_SCOPE), (req, res) => {
    res.send('Hello World from API!')
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

