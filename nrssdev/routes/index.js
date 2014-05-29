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
					console.log("Up top");
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
};

//route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
