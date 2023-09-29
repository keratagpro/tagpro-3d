import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import * as fs from 'fs/promises';
import template from 'lodash/template.js';
import { dirname } from 'path';
import { defineConfig } from 'rollup';
import copy from 'rollup-plugin-copy';
import { fileURLToPath } from 'url';

import pkg from './package.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const meta = template(await fs.readFile(__dirname + '/src/meta.tpl.ts', 'utf8'));
const banner = meta({ version: pkg.version });

const globals = {
	'fast-average-color': 'FastAverageColor',
	'loglevel': 'log',
	'pixi.js': 'PIXI',
	'tagpro': 'tagpro',
	'three': 'THREE',
};

export default defineConfig({
	input: 'src/index.ts',
	output: {
		file: 'docs/tagpro-3d.user.js',
		format: 'iife',
		async banner() {
			await fs.writeFile('docs/tagpro-3d.meta.js', banner, 'utf8');
			return banner;
		},
		globals,
		interop: 'esModule',
	},
	external: Object.keys(globals),
	plugins: [
		commonjs(),
		nodeResolve(),
		typescript(),
		copy({
			targets: [{ src: 'assets/', dest: 'docs/' }],
		}),
	],
});
