var ObjectId = require('mongodb').ObjectID
    , parser = require('rssparser')
    , Articles = require('./articles').Articles;

//feed:
//	_id:
//  title:
//  type:
//  feed_url:
//  site_url:
//  last_checked:
//  last_modified:
//  description:
//  subscribers: []

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
				var newfeed = {'type':out.type
						      ,'title':out.title
						      ,'description':out.description
						      ,'feed_url':url
						      ,'site_url':out.url
						      ,'last_modified':out.last_modified};
				feeds.findAndModify({'feed_url':url}
								   ,[['_id','asc']]
				                   ,{$set:newfeed}
				                   ,{'upsert':true,'new':true}
				                   ,function(err,feed) {
					if(err) {
						callback(err,null);
						return;
					}
					var articles = new Articles(db);
					articles.upsertArticles(feed._id,out.items, function(err) {
						if (err) {
							callback(err,null);
						} else {
							callback(null,feed);
						}
					});
				});
			}
		});
	};
	
	this.addFeedToUser = function(url, user, callback) {
		"use strict";
		feeds.update({'feed_url': url}
		            ,{$addToSet: {'subscribers':user._id}}
		            ,function(err,feed) {
		            	callback(err,feed);
		            });
	};
	
	this.getUserFeeds = function(user_id, callback) {
		"use strict";
		feeds.find({'subscribers':user_id}
		          ,{'feed_url':true, 'title':true}
		          ,{'sort':'title'})
		     .toArray(function(err,data) {
		        	  	if (err) {
		        		  callback(err,null);
		        		  return;
		        	    }
		        	    callback(null,data);
		            });
	};
}

module.exports.Feeds = Feeds;