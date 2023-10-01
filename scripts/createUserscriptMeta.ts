import * as fs from 'fs';
import template from 'lodash/template.js';

export function createUserscriptMeta({
	templateFile,
	version,
	includes,
	requires,
}: {
	templateFile: string;
	version: string;
	includes: string[];
	requires: string[];
}) {
	const tpl = fs.readFileSync(templateFile, 'utf-8');
	const meta = template(tpl);

	return meta({
		version,
		includes,
		requires,
	});
}
