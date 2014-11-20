//
// Web pages
//

var express = require('express');
var fs = require('fs');
var restler = require('restler');
var uuid = require('uuid');

var dummystate = {};

function setup(app) {

  var callback_template = null;
  var index_template = null;

  app.use(express.static(__dirname + '/../public'));

  app.get('/login', function (req, res, done) {
    var forward = req.query.forward || '/';
    var stateid = uuid.v4().replace(/-/g,'').substring(0,4);
    dummystate[stateid] = { forward: forward };
    // res.send('Login start page');
    var loginUrl = 'https://accounts.spotify.com/authorize?client_id=' +
                    encodeURIComponent(app.config.spotifyClientId) +
                    '&response_type=code&redirect_uri=' +
                    encodeURIComponent(app.config.spotifyRedirect) +
                    '&scope=&state=' + stateid;
    // res.send('Go <a href="' + loginUrl + '">here</a>');
    res.redirect(loginUrl);
    done();
  });

  app.get('/login/callback', function (req, res, done) {
    var code = req.query.code;
    var state = req.query.state;
    // get access and refresh tokens
    restler.post('https://accounts.spotify.com/api/token', {
      multipart: false,
      headers: {
        'Authorization': 'Basic '+ (new Buffer(app.config.spotifyClientId+':'+app.config.spotifyClientSecret)).toString('base64')
      },
      data: {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: app.config.spotifyRedirect
      }
    }).on('complete', function(d) {
      console.log('got token response', d);
      // get info about the current user
      var me_url = 'https://api.spotify.com/v1/me?access_token=' + d.access_token;
      console.log('me_url', me_url);
      restler.get(me_url).on('complete', function(me_response) {
        console.log('got userinfo', me_response);
        // get or create user in db
        app.users.getOrCreate(me_response.id, {
          access_token: d.access_token,
          refresh_token: d.refresh_token,
          name: me_response.display_name,
          avatar: me_response.images[0].url
        }, function(userdata) {
          console.log('created user', userdata);
          var stateobj = dummystate[state];
          var tokendata = { id: me_response.id, name: me_response.display_name, avatar: me_response.images[0].url, ts: ~~(new Date()) };
          console.log('tokendata', tokendata);
          var newtoken = app.tokenHelper.encrypt(tokendata);
          res.cookie('al_userinfo', newtoken, { maxAge: 30*24*60*60*1000, path: '/' });
          res.cookie('sp_access_token', d.access_token, { maxAge: 30*24*60*60*1000, path: '/' });
          // res.send('Login callback for user ' + userdata.id + ', set token cookie to ' + newtoken + ' and go <a href="' + stateobj.forward + '">here</a>');
          res.redirect(stateobj.forward);
          done();
        });
      });
    });
  });

  app.get('/logout', function (req, res, done) {
    var forward = req.query.forward || '/';
    res.cookie('al_userinfo', '', { maxAge: 3600000, path: '/' });
    res.cookie('sp_access_token', '', { maxAge: 3600000, path: '/' });
    res.redirect(forward);
    done();
  });

  app.get('/', function (req, res, done) {
    var tokencookie = req.cookies && req.cookies['al_userinfo'];
    console.log('tokencookie', tokencookie);
    var tokeninfo = app.tokenHelper.decrypt(tokencookie);
    console.log('tokeninfo', tokeninfo);
    res.render('editor.html', {
      docid: '',
      docver: 0,
      docdata: '',
      docowner: '',
      userid: tokeninfo && tokeninfo.id || '',
      username: tokeninfo && tokeninfo.name || '',
      useravatar: tokeninfo && tokeninfo.avatar || ''
    });
    done();
  });

  app.get('/user/:id', function (req, res, done) {
    var tokencookie = req.cookies && req.cookies['al_userinfo'];
    var tokeninfo = app.tokenHelper.decrypt(tokencookie);
    var id = req.params.id;
    console.log('loading user ' + id);
    app.users.get(id, function(user) {
      console.log('got user', user);
      app.users.getDocuments(id, function(docs) {
        res.render('user.html', {
          id: id,
          user: user,
          docs: docs.map(function(did) {
            return { id: did };
          }),
          userid: tokeninfo && tokeninfo.id || '',
          username: tokeninfo && tokeninfo.name || '',
          useravatar: tokeninfo && tokeninfo.avatar || ''
        });
        done();
      })
    });
  });

  app.get('/:id([a-f0-9]+)', function (req, res, done) {
    var tokencookie = req.cookies && req.cookies['al_userinfo'];
    var tokeninfo = app.tokenHelper.decrypt(tokencookie);
    var id = req.params.id;
    console.log('loading id ' + id);
    app.documents.getLatest(id, function(data) {
      console.log(data);
      res.render('editor.html', {
        docid: id,
        docver: data.currentversion,
        docdata: data.currentdata,
        docowner: data.owner,
        userid: tokeninfo && tokeninfo.id || '',
        username: tokeninfo && tokeninfo.name || '',
        useravatar: tokeninfo && tokeninfo.avatar || ''
      });
      done();
    });
  });

  app.get('/:id([a-f0-9]+)/versions', function (req, res, done) {
    var tokencookie = req.cookies && req.cookies['al_userinfo'];
    var tokeninfo = app.tokenHelper.decrypt(tokencookie);
    var id = req.params.id;
    console.log('loading id ' + id + ' versions');
    app.documents.getLatest(id, function(data) {
      app.documents.getVersions(id, function(versions) {
        console.log(data);
        res.render('versions.html', {
          docid: data.id,
          docdata: data.data,
          docowner: data.owner,
          versions: versions,
          userid: tokeninfo && tokeninfo.id || '',
          username: tokeninfo && tokeninfo.name || '',
          useravatar: tokeninfo && tokeninfo.avatar || ''
        });
        done();
      });
    });
  });

  app.get('/:id([a-f0-9]+)/:ver([0-9]+)', function (req, res, done) {
    var tokencookie = req.cookies && req.cookies['al_userinfo'];
    var tokeninfo = app.tokenHelper.decrypt(tokencookie);
    var id = req.params.id;
    var ver = ~~req.params.ver;
    console.log('loading id ' + id + ' version ' + ver);
    app.documents.getVersion(id, ver, function(data) {
      console.log(data);
      res.render('editor.html', {
        docid: data.id,
        docver: ver,
        docdata: data.data,
        docowner: data.owner,
        userid: tokeninfo && tokeninfo.id || '',
        username: tokeninfo && tokeninfo.name || '',
        useravatar: tokeninfo && tokeninfo.avatar || ''
      });
      done();
    });
  });

}

exports.setup = setup;
