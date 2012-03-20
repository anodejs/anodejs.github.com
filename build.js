var jade = require('jade');
var path = require('path');
var fs = require('fs');
var blog = require('./blog');
require('coffee-script');
var watchr = require('watchr');

process.chdir(__dirname);

var projectsDir = 'projects';
var jadeFile = 'index.jade';
var outputFile = 'index.html';
var contribFile = 'contrib.json';
var blogdir = path.join(__dirname, 'blog')


var options = {
	title: 'anode@microsoft',
	projects: enumerateProjects(),
	contrib: readContrib(),
};

function build() {
	blog(blogdir, function(err, posts) {
		options.blog = posts;
		console.time("build");
		console.info('Building...');
		return jade.renderFile(jadeFile, options, function(err, html) {
			if (err) console.error(err);
			else {
				fs.writeFile(outputFile, html, function(err) {
					console.timeEnd("build");
					if (err) console.error(err);
				});
			}
		});
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
