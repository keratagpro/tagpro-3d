var ghPages = require('gh-pages');
var gitConfig = require('git-config');

var project = require('../package.json');

ghPages.publish('./dist', {
	user: gitConfig.sync('.git/config').user,
	clone: '.publish',
	message: `Update to ${project.version}`
}, function(err) {
	if (!err) {
		console.log(`published v${project.version} to github.`);
	}
});
