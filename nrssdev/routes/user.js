var bcrypt  = require('bcrypt-nodejs')
	,ObjectId = require('mongodb').ObjectID;

function User(db) {
	"use strict";
	
	var users = db.collection("users");

	this.findById = function(id, callback) {
		"use strict";
		
		if(!id) {
			callback(Error("No session ID provided"), null);
		}
		
		users.findOne({'_id':new ObjectId(id)}, function(err, user) {
			if (err) return callback(err, null);
			
			if (!user) {
                callback(new Error("User ID: " + id + " does not exist"), null);
                return;
            }

            callback(null, user);
		});
	};
	
	this.checkExists = function(email, callback) {
		"use strict";
		
		if(!email) {
			callback(Error("No email provided"), null);
		}
		
		users.findOne({'email':email}, function(err, user) {
			if (err) return callback(err, null);
			
			if (!user) {
				callback(null, null);
				return;
			}
			
            callback(null, user);
		});
	};
	
	this.generateHash = function(password) {
	    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
	};

	this.createUser = function(email,passwordHash,callback) {
		var newUser = {'email':email, 'password':passwordHash};
		users.insert(newUser,function(err,result) {
			callback(err,result[0]);
		});
	};
	
}

module.exports.User = User;