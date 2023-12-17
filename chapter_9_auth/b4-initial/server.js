
'use strict';
const pkg = require('./package.json');
const {URL} = require('url');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const expressSession = require('express-session');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const nconf = require('nconf');
const https = require('https');
const fs = require('fs');

//nconf configuration.
nconf
  .argv()
  .env('__')
  .defaults({'NODE_ENV': 'development'});

const NODE_ENV = nconf.get('NODE_ENV');
const isDev = NODE_ENV === 'development';
nconf
  .defaults({'conf': path.join(__dirname, `${NODE_ENV}.config.json`)})
  .file(nconf.get('conf'));

const serviceUrl = new URL(nconf.get('serviceUrl'));
const servicePort =
    serviceUrl.port || (serviceUrl.protocol === 'https:' ? 443 : 80);

const app = express();

// Setup Express sessions.
if(isDev) {

  // Use FileStore in development mode.
  const FileStore = require('session-file-store')(expressSession);
  app.use(expressSession({
    resave: false,
    saveUninitialized: true,
    secret: 'unguessable',
    store: new FileStore(),
  }));
} else {

  // Use Redistore in production mode.
}

// Password Authentication
// passport.serializeUser((profile, done) => done(null, {
//   id: profile.id,
//   provider: profile.provider,
// }));
// passport.deserializeUser((user, done) => done(null, user));
// app.use(passport.initialize());
// app.use(passport.session());

// passport.use(new FacebookStrategy({
//   clientID: nconf.get('auth:facebook:appID'),
//   clientSecret: nconf.get('auth:facebook:appSecret'),
//   callbackURL: new URL('/auth/facebook/callback', serviceUrl).href,
//   }, (accessToken, refreshToken, profile, done) => done(null, profile)));

// app.get('/auth/facebook', passport.authenticate('facebook'));
// app.get('/auth/facebook/callback', passport.authenticate('facebook', {
//   successRedirect: '/',
//   failureRedirect: '/',
// }))  


// passport.use(new TwitterStrategy({
//   consumerKey: nconf.get('auth:twitter:consumerKey'),
//   consumerSecret: nconf.get('auth:twitter:consumerSecret'),
//   accessToken: nconf.get('auth:twitter:accessToken'),
//   secretToken: nconf.get('auth:twitter:secretToken'),
//   callbackURL: new URL('/auth/twitter/callback', serviceUrl).href,
// }, (accessToken, tokenSecret, profile, done) => done(null, profile)));

// app.get('/auth/twitter', passport.authenticate('twitter'));
// app.get('/auth/twitter/callback', passport.authenticate('twitter', {
//   successRedirect: '/',
//   failureRedirect: '/',
// }));

app.use(morgan('dev'));

app.get('/api/version', (req, res) => res.status(200).json(pkg.version));

// Serve webpack assets.
if (isDev) {
  const webpack = require('webpack');
  const webpackMiddleware = require('webpack-dev-middleware');
  const webpackConfig = require('./webpack.config.js');
  app.use(webpackMiddleware(webpack(webpackConfig), {
    publicPath: '/',
    stats: {colors: true},
  }));
} else {
  app.use(express.static('dist'));
}

app.get('/api/session', (req, res) => {
  const session = {auth: req.isAuthenticated()};
  console.log(session)
  res.status(200).json(session);
})

app.get('/auth/signout', (req, res) => {
  req.logout();
  res.redirect('/');
})

const httpsOptions = {
  key: fs.readFileSync('./cert2/localhost/localhost.decrypted.key'),
  cert: fs.readFileSync('./cert2/localhost/localhost.crt')
}

if(isDev) {
  const httpsServer = https.createServer(httpsOptions, app);
  httpsServer.listen(servicePort, () => {
    console.log('HTTPS Server running on port 60900');
  })
  
} else {
  app.listen(servicePort, () => {
    console.log('Ready Prod')
  })
}


