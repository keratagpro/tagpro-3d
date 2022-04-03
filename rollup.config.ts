import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import * as fs from 'fs';
import { defineConfig } from 'rollup';
import copy from 'rollup-plugin-copy';
import serve from 'rollup-plugin-serve';
const template = require('lodash.template');

import { version } from './package.json';
import { extractBanner } from './scripts/extractBannerPlugin';

const isProduction = process.env.NODE_ENV === 'production';
const ROOT_URL = isProduction ? 'https://keratagpro.github.io/tagpro-3d/' : 'http://localhost:10001/';

const GLOBALS = [
	{
		name: 'tagpro',
		global: 'tagpro',
	},
	{
		name: 'three',
		global: 'THREE',
		umd: 'https://unpkg.com/three@0.139.2/build/three.min.js',
		esm: 'https://unpkg.com/three@0.139.2/build/three.module.js',
	},
	{
		name: 'comlink',
		global: 'Comlink',
		umd: 'https://unpkg.com/comlink@4.3.1/dist/umd/comlink.min.js',
		esm: 'https://unpkg.com/comlink@4.3.1/dist/esm/comlink.js',
	},
];

const globals = GLOBALS.reduce((mem: Record<string, string>, dep) => {
	if (dep.global) {
		mem[dep.name] = dep.global;
	}
	return mem;
}, {});

const external = Object.keys(globals);

const paths = GLOBALS.reduce((mem: Record<string, string>, dep) => {
	if (dep.esm) {
		mem[dep.name] = dep.esm;
	}
	return mem;
}, {});

const requires = GLOBALS.reduce((urls: string[], dep) => (dep.umd ? urls.concat(dep.umd) : urls), []);

const meta = template(fs.readFileSync(__dirname + '/src/meta.tpl', 'utf8'));

const banner = meta({
	version,
	requires,
	resources: { worker: ROOT_URL + 'tagpro-3d.worker.js' },
});

export default defineConfig([
	{
		input: 'src/index.ts',
		output: {
			file: 'docs/tagpro-3d.user.js',
			format: 'iife',
			banner,
			globals,
			interop: false, // NOTE: tries to load tagpro.default, if true
		},
		external,
		plugins: [
			json(),
			commonjs(),
			nodeResolve(),
			typescript(),
			extractBanner({ file: 'docs/tagpro-3d.meta.js' }),
			copy({
				targets: [{ src: 'assets/', dest: 'docs/' }],
			}),
			!isProduction && process.env.ROLLUP_WATCH && serve('docs'),
		],
	},
	{
		input: 'src/worker.ts',
		output: {
			file: 'docs/tagpro-3d.worker.js',
			format: 'esm',
			paths,
		},
		external,
		plugins: [typescript(), nodeResolve(), commonjs()],
	},
]);
