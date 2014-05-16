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

function Articles(db) {
	"use strict";
	
	var articles = db.collection("articles");
	
	this.upsertArticles = function(feed_id, data, callback) {
		async.each(data,function(article,callback) {
			article.feed_id = feed_id;
			articles.update({'feed_id':article.feed_id,'title':article.title},
					        article,
					        {'upsert':true},
					        callback);
			},
			function(err) {
				if (err) throw err;
			});
	};
}

module.exports.Articles = Articles;