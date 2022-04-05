import * as fs from 'fs/promises';
import { Plugin } from 'rollup';

interface Options {
	file: string;
}

export function extractBanner(options: Options): Plugin {
	return {
		name: 'extract-banner-plugin',
		async generateBundle(output) {
			const banner = await output.banner();
			await fs.writeFile(options.file, banner, 'utf8');
			console.info(`created ${options.file}.`);
		},
	};
}
