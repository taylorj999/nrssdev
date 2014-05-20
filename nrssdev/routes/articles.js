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
	
	var articles = db.collection("articles");
	var userarticles = db.collection("userarticles");
	
	this.populateUserArticles = function(feed,article,callback) {
		async.map(feed.subscribers
				 ,function(item,callback_a) {
			  		var subsdoc = {'user_id':item,'feed_id':feed._id,'article_id':article._id};
			  		callback_a(null,subsdoc);
				  }
		         ,function(err,results) {
		        	 if (err) {
		        		 callback(err,null);
		        	 } else {
		        		 async.each(results,function(result,callback_b) {
		        			 userarticles.update(result
		        					            ,{$set:result}
		        			                    ,{'upsert':true}
		        			                    ,callback_b);
		        		 },
		        		 function(err) { callback(err,null); });
		        	 }
		         });
		
	};
	
	this.upsertArticles = function(feed, data, callback) {
		async.each(data,function(article,callback) {
			article.feed_id = feed.feed_id;
			articles.findAndModify({'feed_id':article.feed_id,'title':article.title}
			                      ,[['_id','asc']]
			                      ,{$set:article}
			                      ,{'upsert':true,'new':true}
			                      ,function(err,data) {
			                    	  if (err) {
			                    		  callback(err);
			                    		  return;
			                    	  } else {
			                    		  this.populateUserArticles(feed,data,callback);
			                    	  }
			                      });
			},
			function(err) {
				if (err) throw err;
			});
	};
}

module.exports.Articles = Articles;