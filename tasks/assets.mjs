import ncp from 'ncp';

ncp('./assets', './dist/assets', function (err) {
	if (err) {
		return console.error(err);
	}

	console.log('Copied assets to dist.');
});
