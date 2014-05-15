var crypto = require('crypto');

function SessionDAO(db) {
	"use strict";
	
	var sessions = db.collection("sessions");
	
	this.getUsername = function(session_id, callback) {
        "use strict";

        if (!session_id) {
            callback(Error("No session ID provided"), null);
            return;
        }

        sessions.findOne({ '_id' : session_id }, function(err, session) {
            "use strict";

            if (err) return callback(err, null);

            if (!session) {
                callback(new Error("Session ID: " + session + " does not exist"), null);
                return;
            }

            callback(null, session.username);
        });
    };
	
	this.createSession = function(username, callback) {
        "use strict";

        var curr_date = (new Date()).valueOf().toString();
        var random = Math.random().toString();
        
        var shacrypt = crypto.createHash('sha1');
        
        shacrypt.update(curr_date + random + username);
        
        var session_id = shacrypt.digest('hex');

        var session = {'username': username, 
        		       '_id': session_id, 
        		       'created': new Date()};

        sessions.insert(session, function (err, result) {
            "use strict";
            callback(err, session_id);
        });
    };
    
    this.deleteSession = function(session_id, callback) {
        "use strict";
        sessions.remove({ '_id' : session_id }, function (err, numRemoved) {
            "use strict";
            callback(err);
        });
    };
}

module.exports.SessionDAO = SessionDAO;