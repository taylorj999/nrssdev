var UserSession = require('./usersession');

var index = function(req, res){
	  res.render('index', { title: 'Express Swig Test', username: req.username });
	};
	
module.exports = exports = function(app, db, passport) {
	"use strict";
	
	var userSession = new UserSession(db);
	
	app.use(userSession.checkLoginStatus);
	
	app.get('/',index);
	
	app.get('/login', function(req,res) {
		res.render('login', { message: req.flash('loginMessage')});
	});
	
	app.get('/signup', function(req, res) {
		res.render('signup', { message: req.flash('signupMessage')});
	});
	
	app.get('/profile', userSession.checkLoginStatus, function(req, res){
		res.render('profile', { user: req.user});
	});
	
	app.get('/logout', function(req,res) {
		req.logout();
		res.redirect('/');
	});
	
	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the login page if there is an error
		failureFlash : true // allow flash messages
	}));
};

