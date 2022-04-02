import { template } from 'lodash-es';
import * as fs from 'fs';

const meta = template(fs.readFileSync('./src/meta.js.tpl'));
const version = require('../package.json').version;

fs.writeFile('./dist/tagpro-3d.meta.js', meta({ version: version }), function (err) {
	if (err) {
		console.log(err);
	}

	console.log('wrote meta file.');
});
