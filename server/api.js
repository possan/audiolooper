//
// API endpoints
//

function setup(app) {

  app.get('/api', function (req, res) {
    res.send('API root');
  });

  app.post('/api/doc', function (req, res, done) {
    var tokencookie = req.cookies && req.cookies['al_userinfo'];
    var tokeninfo = app.tokenHelper.decrypt(tokencookie);
    var data = req.body.data;
    var origin = req.body.origin;
    console.log('saving document.', data);
    app.documents.create(tokeninfo.id, origin, function(docid) {
      console.log('got id', docid);
      app.users.addDocument(tokeninfo.id, docid, function(alldocs) {
       console.log('got list of user docs', alldocs);
        app.documents.save(docid, data, tokeninfo.id, function(doc) {
          console.log('got doc response', doc);
          if (doc) {
            res.send({
              id: doc.id,
              version: doc.currentversion,
              owner: doc.owner,
              data: doc.currentdata
            });
          } else {
            res.send(400);
          }
          done();
        });
      });
    });
  });

  app.post('/api/doc/:id([0-9a-f]+)', function (req, res, done) {
    var tokencookie = req.cookies && req.cookies['al_userinfo'];
    var tokeninfo = app.tokenHelper.decrypt(tokencookie);
    var data = req.body.data;
    var id = req.params.id;
    app.documents.save(id, data, tokeninfo.id, function(doc) {
      console.log('got doc response', doc);
      if (doc) {
        res.send({
          id: doc.id,
          version: doc.currentversion,
          owner: doc.owner,
          data: doc.currentdata
        });
      } else {
        res.send(400);
      }
      done();
    });
  });

}

exports.setup = setup;
