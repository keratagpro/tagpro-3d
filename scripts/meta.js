var _ = require('lodash');
var fs = require('fs');

var meta = _.template(fs.readFileSync('./src/meta.tpl.js'));
var version = require('../package.json').version;

fs.writeFile('./dist/tagpro-3d.meta.js', meta({ version: version }), function(err) {
	if (err) {
		console.log(err);
	}

	console.log('wrote meta file.');
});