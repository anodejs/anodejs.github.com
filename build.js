var jade = require('jade');
var path = require('path');
var fs = require('fs');

process.chdir(__dirname);

var projectsDir = 'projects';
var jadeFile = 'index.jade';
var outputFile = 'index.html';
var contribFile = 'contrib.json';

var options = {
	title: 'anode@microsoft',
	projects: enumerateProjects(),
	contrib: readContrib(),
};

function build() {

	console.info('Rendering', jadeFile, '==>', outputFile);
	return jade.renderFile(jadeFile, options, function(err, html) {
		if (err) console.error(err);
		else {
			fs.writeFile(outputFile, html, function(err) {
				if (err) console.error(err);
			});
		}
	});

}

build();

if (process.argv[2] === '--watch' ||
	process.argv[2] === '-w') {
	console.log('Watching', jadeFile, 'for changes...');
	fs.watch(jadeFile, function(e) {
		console.log(e);
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