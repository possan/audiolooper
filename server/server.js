var express = require('express');
var DB = require('./db').DB;
var model = require('./model');
var TokenHelper = require('./tokenhelper').TokenHelper;
var api_setup = require('./api').setup;
var web_setup = require('./web').setup;
var bodyParser = require('body-parser')
var fs = require('fs');

var config = {};

function loadConfig(filename) {
  console.log('loadConfig', filename);
  if (!fs.existsSync(filename)) {
    return;
  }
  var d = JSON.parse(fs.readFileSync(filename, 'UTF-8'));
  if (d) {
    for(var k in d) {
      config[k] = d[k];
    }
  }
}

loadConfig('server/config.local.json');
loadConfig('server/config.production.json');

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
