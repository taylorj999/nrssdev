var SessionDAO = require('../controllers/sessiondao').SessionDAO;

function UserSession(db) {
    "use strict";
    
    var session = new SessionDAO(db);

    this.checkLoginStatus = function (req, res, next) {
    	var session_id = req.cookies.session;
    	
    	session.getUsername(session_id, function(err, username) {
            "use strict";

            if (!err && username) {
                req.username = username;
            } else {
            	req.username = 'NotFound';
            }
            return next();
        });
    };
    
    
}

module.exports = UserSession;