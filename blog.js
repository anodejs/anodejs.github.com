var async = require('async');
var fs = require('fs');
var path = require('path');
var marked = require('marked');

function render(blogdir, callback) {
  var posts = [];

  return fs.readdir(blogdir, function(err, files) {
    return async.forEach(files, function(file, cb) {
      file = path.join(blogdir, file);
      return fs.stat(file, function(err, stat) {
        if (!stat.isDirectory()) return cb(); // nothing to do
        return renderPost(file, function(err, post) {
          posts.push(post);
          return cb();
        });
      });
    }, function(err) {
      if (err) return callback(err);
      posts.sort(function(a, b) {
        var da = Date.parse(a.date).valueOf();
        var db = Date.parse(b.date).valueOf();
        return da - db;
      });
      return callback(null, posts);
    });
  });  
}

function renderPost(postdir, callback) {
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
      return callback(null, post);
    });
  });
}

module.exports = render;