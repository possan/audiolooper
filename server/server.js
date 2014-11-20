var express = require('express');
var DB = require('./db').DB;
var model = require('./model');
var TokenHelper = require('./tokenhelper').TokenHelper;
var api_setup = require('./api').setup;
var web_setup = require('./web').setup;
var bodyParser = require('body-parser')

var config = {
  // testing credentials
  spotifyClientId: 'af47e54fab1d4610aa62402cbb91d63a',
  spotifyClientSecret: '3032af33e3ca49c79ca2d75eee3b87a9',
  spotifyRedirect: 'http://localhost:3088/login/callback',
  redisHost: '127.0.0.1',
  redisPort: 6379,
  tokenHelperSecret: '231312224d234',
  noTemplateCache: true
};

var app = express();
app.config = config;
app.db = new DB(config.redisHost, config.redisPort);
app.documents = new model.Documents(app.db);
app.users = new model.Users(app.db);
app.tokenHelper = new TokenHelper(config.tokenHelperSecret);
app.engine('html', require('ejs').__express);
app.use(require('cookie-parser')());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

api_setup(app);
web_setup(app);

var server = app.listen(3088, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port);
});
