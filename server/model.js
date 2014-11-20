//
// Database facade
//

var uuid = require('uuid');

var Documents = function(db) {
  this.db = db;
}

Documents.prototype.create = function(ownerid, origin, callback) {
  console.log('Documents: create', ownerid, origin);
  var _this = this;
  var id = uuid.v4().replace(/\-/g, '').substring(0, 16);
  this.db.get('doc/'+id+'/meta', function(data) {
    if (data) {
      // try again with a recursive loop
      _this.create(ownerid, callback);
      return;
    }

    // not already existing..
    var newdata = {
      id: id,
      owner: ownerid,
      origin: origin,
      versions: [],
      created: ~~(new Date()),
      currentversion: 0,
      currentdata: ''
    };

    _this.db.set('doc/'+id+'/meta', newdata, function(doc) {
      console.log('Documents: created ' + id, doc);
      callback(id);
    });
  });
}

Documents.prototype.getVersion = function(key, version, callback) {
  // callback({ key: key, origin: '', owner: '', version: '', data: '' });
  this.db.get('doc/'+key+'/'+version, function(versiondata) {
    callback(versiondata);
  });
}

Documents.prototype.getVersions = function(key, callback) {
  // callback({ key: key, origin: '', owner: '', version: '', data: '' });
  this.db.get('doc/'+key+'/meta', function(latest) {
    var versions = [];
    for(var j=latest.currentversion; j>=1; j--) {
      versions.push({ version: j, updated: ~~0 });
    }
    callback(versions);
  });
}

Documents.prototype.getLatest = function(key, callback) {
  // callback({ key: key, origin: '', owner: '', version: '', data: '' });
  this.db.get('doc/'+key+'/meta', function(metadata) {
    callback(metadata);
  });
}

Documents.prototype.save = function(key, data, owner, callback) {
  console.log('Documents: save', key, data);
  var _this = this;

  this.db.get('doc/'+key+'/meta', function(metadata) {
    console.log('Documents: got metadata', metadata);

    if (!metadata) {
      callback(null);
      return;
    }

    if (metadata.owner != owner) {
      callback(null);
      return;
    }

    metadata.currentversion = (metadata.currentversion || 0) + 1;
    metadata.currentdata = data;

    _this.db.set('doc/'+key+'/meta', metadata, function(savedmetadata) {
      console.log('Documents: saved metadata', savedmetadata);

      var versiondata = {
        id: key,
        owner: metadata.owner,
        index: metadata.currentversion,
        created: ~~(new Date()),
        data: data
      };

      _this.db.set('doc/'+key+'/'+metadata.currentversion, versiondata, function(savedversion) {
        console.log('Documents: saved version', savedversion);
        callback(savedmetadata);
      });
    });
  });
}

exports.Documents = Documents;



var Users = function(db) {
  this.db = db;
}

Users.prototype.getOrCreate = function(id, data, callback) {
  this.update(id, data, callback);
}

Users.prototype.get = function(id, callback) {
  console.log('Users: getting user', id);
  this.db.get('user/'+id +'/meta', function(data) {
    console.log('Users: got', data);
    callback(data);
  });
}

Users.prototype.update = function(id, data, callback) {
  var _this = this;
  this.get(id, function(olddata) {
    console.log('Users: got user', olddata);
    var newdata = olddata || {};
    for (k in data) {
      newdata[k] = data[k];
    }
    console.log('Users: new data', newdata);
    _this.db.set('user/'+id+'/meta', newdata, callback);
  });
}

Users.prototype.addDocument = function(userid, docid, callback) {
  console.log('Users: adding document', userid, docid);
  this.db.appendToList('user/'+userid +'/docs', docid, function(data) {
    console.log('Users: got documents', data);
    callback(data);
  });
}

Users.prototype.getDocuments = function(userid, callback) {
  console.log('Users: list documents', userid);
  this.db.getList('user/'+userid +'/docs', function(list) {
    console.log('Users: got documents', list);
    callback(list);
  });
}

exports.Users = Users;
