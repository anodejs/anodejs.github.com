require('coffee-script');

var jade = require('jade');
var path = require('path');
var fs = require('fs');
var async = require('async');
var renderBlog = require('./blog');
var watchr = require('watchr');

process.chdir(__dirname);

var projectsDir = 'projects';
var jadeFile = 'index.jade';
var outputFile = 'index.html';
var contribFile = 'contrib.json';
var rssFile = 'rss.xml';

var blogdir = path.join(__dirname, 'blog')

var options = {
	title: 'anode@microsoft',
	projects: enumerateProjects(),
	contrib: readContrib(),
};

function build() {
	console.time("build");
	console.info('Building...');

	return async.series([
		function(cb) {
			return renderBlog(blogdir, options.contrib, function(err, blog) {
				if (err) return cb(err);
				options.blog = blog.posts;

				// write rss.xml
				return fs.writeFile(rssFile, blog.rss, cb);
			});
		},
		function(cb) {
			return fs.readFile(path.join(__dirname, 'disqus.html'), function(err, data) {
				if (err) return cb(err);
				options.disqus = data.toString();
				return cb();
			});
		},
		function(cb) {
			return jade.renderFile(jadeFile, options, function(err, html) {
				if (err) return cb(err);
				return fs.writeFile(outputFile, html, function(err) {
					if (err) return cb(err);
					return cb();
				});
			});
		}
	], function(err) {
		if (err) console.error(err);
		else console.timeEnd('build');
	});
}

build();

if (process.argv[2] === '--watch' ||
	process.argv[2] === '-w') {
	console.log('Watching', jadeFile, 'for changes...');
	watchr.watch(__dirname, function(e) {
		build();
	});
}
else {
	console.log('Run with -w or --watch to watch stay up and build on changes');
}

function enumerateProjects() {
	return fs.readdirSync(projectsDir).map(function(file) {
		if (path.extname(file) !== '.json') return; // take only .json files
		var p = path.join(projectsDir, file);
		return JSON.parse(fs.readFileSync(p));
	});
}

function readContrib() {
	return JSON.parse(fs.readFileSync(contribFile));
}
