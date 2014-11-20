//
// Database facade
//

var redis = require('redis');

var DB = function(hostname, port) {
  this.client = redis.createClient(port, hostname, {});
  this.client.select(2);
  this.client.on("error", function(err) {
    console.log("Error " + err);
  });
}


DB.prototype.set = function(keyname, data, callback) {
  console.log('DB: set key', keyname, JSON.stringify(data));
  this.client.set(keyname, JSON.stringify(data));
  callback(data);
}

DB.prototype.get = function(keyname, callback) {
  console.log('DB: get key', keyname);
  this.client.get(keyname, function(err, data) {
    console.log('DB: got string', data);
    if (data) {
      data = JSON.parse(data);
    }
    callback(data);
  });
}

DB.prototype.appendToList = function(listname, item, callback) {
  var _this = this;
  console.log('DB: append to list', listname, item);
  this.get(listname, function(data) {
    data = data || [];
    if (data.indexOf(item) == -1) {
      data.push(item);
    }
    _this.set(listname, data, function() {
      callback(data);
    })
  });
}

DB.prototype.getList = function(listname, callback) {
  console.log('DB: get list', listname);
  this.get(listname, function(data) {
    data = data || [];
    callback(data);
  });
}

DB.prototype.removeFromList = function(listname, item, callback) {
  var _this = this;
  console.log('DB: remove from list', listname, item);
  this.get(listname, function(data) {
    data = data || [];
    if (data.indexOf(item) != -1) {
      data.remove(item);
    }
    _this.set(listname, data, function() {
      callback(data);
    })
  });
}

exports.DB = DB;
