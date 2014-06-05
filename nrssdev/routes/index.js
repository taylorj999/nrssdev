var Feeds = require('./feeds').Feeds
   ,Articles = require('./articles');

var index = function(req, res){
	  res.render('index', { title: 'Express Swig Test', username: req.username });
	};
	
module.exports = exports = function(app, db, passport) {
	"use strict";
	
	app.get('/',index);
	
	app.get('/login', function(req,res) {
		res.render('login', { message: req.flash('loginMessage')});
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the login page if there is an error
		failureFlash : true // allow flash messages
	}));

	app.get('/signup', function(req, res) {
		res.render('signup', { message: req.flash('signupMessage')});
	});
	
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	app.get('/profile', isLoggedIn, function(req, res){
		var feeds = new Feeds(db);
		
		feeds.getUserFeeds(req.user._id, function(err, data) {
			console.log(data);
			var pageinfo = {'user': req.user, 'feeds': data};
			if (err) {
				pageinfo.error = err.message;
			}
			res.render('profile', pageinfo);			
		});
	});
	
	app.get('/logout', function(req,res) {
		req.logout();
		res.redirect('/');
	});
	
	app.get('/addfeed', isLoggedIn, function(req,res) {
		res.render('addfeed');
	});
	
	app.post('/addfeed', isLoggedIn, function(req,res) {
		var feeds = new Feeds(db);
		var articles = new Articles(db);
		
		feeds.findByUrl(req.body.url,function(err, feed) {
			if (err) {
				res.render('addfeed',{'error':err.message});
				return;
			}
			// if we failed to find the feed in the db, have the app grab it
			// and add it to the database. If it's already there,
			// just connect it to the user
			if (feed===null) {
				feeds.newFeed(req.body.url,function(err,newfeed) {
					if (err) {
						// the majority of the errors here will be invalid
						// url formatting or inability to get the feed
						res.render('addfeed',{'error':err.message});
						return;
					}
					feeds.addFeedToUser(req.body.url, req.user, function(err,feed) {
						if (err) {
							res.render('addfeed',{'error':err.message});
							return;
						}
						articles.populateUserArticles(feed, req.user,function(err) {
							if (err) {
								res.render('addfeed',{'error':err.message});
								return;
							}
							res.render('addfeed',{'message':'Added feed to account'});
							return;
						});
					});
				});
			} else {
				feeds.addFeedToUser(req.body.url, req.user, function(err,feed) {
					console.log("Adding feed to user");
					if (err) {
						res.render('addfeed',{'error':err.message});
						return;
					}
					articles.populateUserArticles(feed, req.user,function(err) {
						if (err) {
							res.render('addfeed',{'error':err.message});
							return;
						}
						res.render('addfeed',{'message':'Added feed to account'});
						return;
					});
				});
			}
		});
	});
	
	app.get('/articles',isLoggedIn, function(req,res) {
		var articles = new Articles(db);
		
		articles.getUserArticles(req.user._id,function(err,data) {
			if (err) {
				res.render('articles',{'error':err.message});
				return;
			}
			res.render('articles',{'user':req.user,'articles':data});
			return;
		});
	});
	
	app.get('/viewarticle',function(req,res) {
		var articles = new Articles(db);
		
		articles.getArticle(req.query.id, function(err,data) {
			if (err) {
				res.render('viewarticle',{'error':err.message});
				return;
			}
			res.render('viewarticle',{'user':req.user,'article':data});
			return;
		});
	});
	
	app.get('/viewarticle-api',isLoggedInAPI,function(req,res) {
		var articles = new Articles(db);
		
		articles.getArticle(req.query.id, function(err,data) {
			if (err) {
				res.jsonp({'status':'error', 'error':err.message});
				return;
			}
			res.jsonp({'status':'success', 'article':data});
			return;
		});
	});
	
	app.get('/test/viewarticle-api',function(req,res) {
		res.render('test/viewarticle-api',{'id':req.query.id});
		return;
	});
	
	app.get('/articles-api',function(req,res) {
		var articles = new Articles(db);
		
		articles.getUserArticles(req.user._id,function(err,data) {
			if (err) {
				res.jsonp({'status':'error','error':err.message});
				return;
			}
			res.jsonp({'status':'success','articles':data});
			return;
		});
	});
	
	app.get('/test/articles-api',isLoggedIn,function(req,res) {
		res.render('test/articles-api',{'user':req.user});
		return;
	});
};

//route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

//route middleware to reject API calls if it doesn't find
//login information
function isLoggedInAPI(req, res, next) {
	if (req.isAuthenticated())
		return next();
	
	res.jsonp({'status':'error','error':'Not logged in.'});
}