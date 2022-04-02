import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';
import { template } from 'lodash-es';
import { defineConfig } from 'rollup';

const meta = template(readFileSync(__dirname + '/src/meta.js.tpl', 'utf8'));

import { version } from './package.json';
const banner = meta({ version });

const globals = {
	jquery: '$',
	clipper: 'ClipperLib',
	three: 'THREE',
	tagpro: 'tagpro',
	rgbquant: 'RgbQuant',
};

export default defineConfig([
	{
		input: 'src/index.ts',
		output: {
			file: 'dist/tagpro-3d.user.js',
			format: 'iife',
			banner,
			globals,
		},
		external: Object.keys(globals),
		plugins: [
			json(),
			typescript(),
			nodeResolve(),
			replace({
				TEXTURES_URL: 'https://keratagpro.github.io/tagpro-balls-3d/textures',
			}),
		],
	},
]);
