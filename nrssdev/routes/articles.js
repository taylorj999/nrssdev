var ObjectId = require('mongodb').ObjectID
   ,async = require('async');

//article:
//	title:
//  summary:
//  url:
//  categories:
//  published_at:
//  time_ago:
//  author:
//  guid:
//  media:
//userarticle:
//  feed_id:
//  user_id:
//  article_id:

function Articles(db) {
	"use strict";
	
	this.articles = db.collection("articles");
	this.userarticles = db.collection("userarticles");
	
}

Articles.prototype.getArticle = function getArticle(article_id, callback) {
	var self = this;
	self.articles.findOne({'_id':new ObjectId(article_id)}, function(err, doc) {
		if (err) { return callback(err,null); }
		if (!doc) { return callback(new Error("No data found"),null); }
		return callback(null, doc);
	});
};

Articles.prototype.getUserArticles = function getUserArticles(user, callback) {
	var self = this;
	self.userarticles.find({'user_id':user._id}).toArray(function(err,data) {
		callback(err,data);
	});
};

Articles.prototype.populateUserArticles = function populateUserArticles(feed, user, callback) {
	var self = this;
	self.articles.find({'feed_id':feed._id}).each(function (err, item) {
		if (err) throw err;
		if (item!=null) {
			var subsdoc = {'user_id':user._id, 'feed_id':feed._id
					      ,'article_id':item._id, 'title':item.title};
			self.userarticles.update(subsdoc
					           ,{$set:subsdoc}
							   ,{'upsert':true}
							   ,function(err) {
								   if (err) callback(err,null);
							   });
		}
	});
	callback(null,null);
};

Articles.prototype.populateUserArticle = function populateUserArticle(feed,article,callback) {
	var self = this;
	if (feed.subscribers === undefined) {
		callback(null,null);
		return;
	}
	async.map(feed.subscribers
			 ,function(item,callback_a) {
		  		var subsdoc = {'user_id':item,'feed_id':feed._id
		  				      ,'article_id':article._id,'title':title};
		  		callback_a(null,subsdoc);
			  }
	         ,function(err,results) {
	        	 if (err) {
	        		 callback(err,null);
	        	 } else {
	        		 async.each(results,function(result,callback_b) {
	        			 self.userarticles.update(result
	        					            ,{$set:result}
	        			                    ,{'upsert':true}
	        			                    ,callback_b);
	        		 },
	        		 function(err) { callback(err,null); });
	        	 }
	         });
	callback(null,null);
};

Articles.prototype.upsertArticles = function upsertArticles(feed, data, callback) {
	var self = this;
	data.forEach(function(article) {
		article.feed_id = feed._id;
		self.articles.findAndModify({'feed_id':article.feed_id,'title':article.title}
		                      ,[['_id','asc']]
		                      ,{$set:article}
		                      ,{'upsert':true,'new':true}
		                      ,function(err,data) {
		                    	  if (err) {
		                    		  callback(err);
		                    	  } else {
		                    		  self.populateUserArticle(feed,data,function (err) { if (err) callback(err); });
		                    	  }
		                      });
		});
	callback(null,null);
};

module.exports = Articles;