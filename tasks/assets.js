var ncp = require('ncp');

ncp('./assets', './dist/assets', function(err) {
	if (err) {
		return console.error(err);
	}

	console.log('Copied assets to dist.');
});