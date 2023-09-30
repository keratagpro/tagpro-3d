import * as fs from 'fs';
import template from 'lodash/template.js';

export interface GlobalDep {
	importName: string;
	globalName: string;
	cdnPath?: string;
}

const includes = [
	'http://tagpro*.koalabeast.com/game*',
	'https://tagpro*.koalabeast.com/game*',
	'http://tangent.jukejuice.com*',
	'https://tangent.jukejuice.com*',
	'https://bash-tp.github.io/tagpro-vcr/game*.html',
];

export function createMeta(templateFile: string, version: string, globals: GlobalDep[]) {
	const tpl = fs.readFileSync(templateFile, 'utf-8');
	const meta = template(tpl);

	return meta({
		version,
		includes,
		requires: globals.reduce((urls: string[], dep) => (dep.cdnPath ? urls.concat(dep.cdnPath) : urls), []),
	});
}
