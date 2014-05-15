var ObjectId = require('mongodb').ObjectID
    , parser = require('rssparser');

//feed:
//	_id:
//  name:
//  type:
//  feed_url:
//  site_url:
//  last_checked:
//  last_changed:
//  description:

function Feeds(db) {
	"use strict";
	
	var feeds = db.collection("feeds");
	
	this.findById = function(id, callback) {
		"use strict";
		
		if(!id) {
			callback(Error("No feed ID provided"), null);
		}
		
		feeds.findOne({'_id':new ObjectId(id)}, function(err, feed) {
			if (err) return callback(err, null);
			
			if (!feed) {
                callback(new Error("Feed ID: " + id + " does not exist"), null);
                return;
            }

            callback(null, feed);
		});
	};
	
	this.findByUrl = function(url, callback) {
		"use strict";
		
		if(!url) {
			callback(Error("No feed url provided"), null);
		}
		
		feeds.findOne({'url':url}, function(err, feed) {
			if (err) return callback(err, null);
			
			if (!feed) {
                callback(null, null);
                return;
            }

            callback(null, feed);
		});
	};
	
	this.newFeed = function(url, callback) {
		"use strict";
		
		parser.parseURL(url,{},function(err, out){
			if (err) {
				callback(err,null);
				return;
			}
			if (out===null) {
				callback(new Error("Not a valid feed url"),null);
				return;
			} else {
				console.log(out);
			}
			callback(null,out);
		});
	};
}

module.exports.Feeds = Feeds;