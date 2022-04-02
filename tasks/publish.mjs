import ghPages from 'gh-pages';
import gitConfig from 'git-config';

const { version } = require('../package.json');

ghPages.publish(
	'./dist',
	{
		user: gitConfig.sync('.git/config').user,
		clone: '.publish',
		message: `Update to ${version}`,
	},
	function (err) {
		if (!err) {
			console.log(`published v${version} to github.`);
		}
	}
);
