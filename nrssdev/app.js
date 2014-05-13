
/**
 * Module dependencies.
 */

var express = require('express')
  , MongoClient = require('mongodb').MongoClient
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , consolidate = require('consolidate')
  , swig = require('swig')
  , parser = require('rssparser')
  , app = express();

MongoClient.connect('mongodb://localhost:27017/rssdata', function(err, db) {
    "use strict";
    if(err) throw err;

    // Register our templating engine
    app.engine('html', consolidate.swig);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/views');

    // Express middleware to populate 'req.cookies' so we can access cookies
    app.use(express.cookieParser());

    // Express middleware to populate 'req.body' so we can access POST variables
    app.use(express.bodyParser());

//    app.use(express.logger('dev'));
    // Application routes
//    routes(app, db);

    app.get('/', routes.index);
    
    app.set('port', process.env.PORT || 3000);
    app.listen(app.get('port'), function() {
    	console.log('Express server listening on port ' + app.get('port'));
    });
});
// all environments
//app.set('port', process.env.PORT || 3000);
//app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
//app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.bodyParser());
//app.use(express.methodOverride());
//app.use(app.router);
//app.use(express.static(path.join(__dirname, 'public')));

// development only
//if ('development' == app.get('env')) {
//  app.use(express.errorHandler());
//}

//app.get('/', routes.index);
//app.get('/users', user.list);

//http.createServer(app).listen(app.get('port'), function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});
