var async = require('async');
var fs = require('fs');
var path = require('path');
var marked = require('marked');
var RSS = require('rss');

function render(blogdir, contrib, callback) {
  var posts = [];

  return fs.readdir(blogdir, function(err, files) {
    return async.forEach(files, function(file, cb) {
      file = path.join(blogdir, file);
      return fs.stat(file, function(err, stat) {
        if (!stat.isDirectory()) return cb(); // nothing to do
        return renderPost(file, contrib, function(err, post) {
          posts.push(post);
          return cb();
        });
      });
    }, function(err) {
      if (err) return callback(err);
      posts.sort(function(a, b) {
        var da = Date.parse(a.date).valueOf();
        var db = Date.parse(b.date).valueOf();
        return db - da;
      });

      return renderRss(blogdir, posts, function(err, rss) {
        if (err) return callback(err);

        return callback(null, {
          posts: posts,
          rss: rss.xml(),
        });
      });
    });
  });  
}

function renderPost(postdir, contrib, callback) {
  var index = path.join(postdir, 'index.md');
  var metafile = path.join(postdir, 'blog.json');
  var post = null;

  return fs.readFile(metafile, function(err, data) {
    if (err) return callback(err);

    post = JSON.parse(data);

    post.name = path.basename(postdir);

    return fs.readFile(index, function(err, data) {
      if (err) return callback(err);
      post.html = marked(data.toString());

      var header = '';
      header += "<h1>" + post.title + "</h1>";
      header += "<p>";

      post.author = contrib[post.author];
      var author = '<a href="' + post.author.home + '">' + post.author.name + '</a>';
      var date = new Date(post.date).toLocaleDateString();

      header += "<small>Posted on " + date + " by " + author + "</small>";
      header += "<br/>";
      header += "</p>";

      post.html = header + post.html;
      return callback(null, post);
    });
  });
}

function renderRss(blogdir, posts, callback) {
  fs.readFile(path.join(blogdir, 'rss.json'), function(err, data) {
    if (err) return callback(err);
    var options = JSON.parse(data);
    var feed = new RSS(options);

    posts.forEach(function(post) {
      var item = {
        title:  post.title,
        description: post.html,
        url: 'http://anodejs.org/#' + post.name,
        author: post.author.name,
        date: post.date,
      };
      
      feed.item(item);
    });

    return callback(null, feed);
  });
}

module.exports = render;