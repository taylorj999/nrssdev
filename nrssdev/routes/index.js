var Feeds = require('./feeds').Feeds;

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
		res.render('profile', { user: req.user});
	});
	
	app.get('/logout', function(req,res) {
		req.logout();
		res.redirect('/');
	});
	
	app.get('/addfeed', isLoggedIn, function(req,res) {
		res.render('addfeed');
	});
	
	app.post('/addfeed', function(req,res) {
		var feeds = new Feeds(db);

		feeds.newFeed(req.body.url, function(err,data) {
			if (err) {
				res.render('addfeed',{'error':err});
			} else {
				res.render('addfeed',{'data':data});
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
