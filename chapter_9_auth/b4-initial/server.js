
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
const GoogleStrategy = require('passport-google-oauth20').Strategy;
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
console.log(serviceUrl,'SERVICE URL')
const servicePort = serviceUrl.port || (serviceUrl.protocol === 'https:' ? 60900 : 80);

console.log(servicePort, "SERVICE PORT");    

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
  const Redistore = require('connect-redis')(expressSession);
  app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: nconf.get('redis:secret'),
    store: new Redistore({
      host: nconf.get('redis:host'),
      port: nconf.get('redis:port'),
    }),
  }));
}

app.use(passport.initialize());
app.use(passport.session());

// Facebook login flow
passport.use(new FacebookStrategy({
  clientID: nconf.get('auth:facebook:appID'),
  clientSecret: nconf.get('auth:facebook:appSecret'),
  callbackURL: new URL('/auth/facebook/callback', serviceUrl).href,
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/',
}));

// Twitter login
passport.use(new TwitterStrategy({
  consumerKey: nconf.get('auth:twitter:consumerKey'),
  consumerSecret: nconf.get('auth:twitter:consumerSecret'),
  callbackURL: new URL('/auth/twitter/callback', serviceUrl).href,
}, (accessToken, tokenSecret, profile, done) => done(null, profile)));

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/',
  failureRedirect: '/',
}));

// Google login oauth
passport.use(new GoogleStrategy({
  clientID: nconf.get('auth:google:clientID'),
  clientSecret: nconf.get('auth:google:clientSecret'),
  callbackURL: new URL('https://b4.example.com:60900/auth/google/callback', serviceUrl).href,
  scope: 'https://www.googleapis.com/auth/plus.login',
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

app.get('/auth/google', passport.authenticate('google', {scope: ['profile']}));
app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/', 
}));
app.get('/auth/google/callback', passport.authenticate('google', ))

 

passport.serializeUser((profile, done) => done(null, {
  id: profile.id,
  provider: profile.provider,
}));
passport.deserializeUser((user, done) => done(null, user));


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

if(isDev) {
  // const privateKey = fs.readFileSync('./cert/localhost/localhost.decrypted.key');
  // const certificate = fs.readFileSync('./cert/localhost/localhost.crt');
  // const credentials = {key:privateKey, cert: certificate};

  // const httpsServer = https.createServer(credentials, app);
  // httpsServer.listen(servicePort, () => {
  //   console.log('HTTPS Server running on port 60900');
  //   app.use('/api', require('./lib/bundle.js')(nconf.get('es')));
  // })
} else {
  const privateKey = fs.readFileSync('./cert/localhost/localhost.decrypted.key');
  const certificate = fs.readFileSync('./cert/localhost/localhost.crt');
  const credentials = {key:privateKey, cert: certificate};

  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(servicePort, () => {
    console.log('HTTPS Server running on port 60900 Production');
    app.use('/api', require('./lib/bundle.js')(nconf.get('es')));
  })
   
}





