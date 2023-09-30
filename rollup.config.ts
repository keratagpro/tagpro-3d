import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import * as fs from 'fs/promises';
import prefixer from 'postcss-prefix-selector';
import { defineConfig } from 'rollup';
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';

import pkg from './package.json' assert { type: 'json' };
import { createMeta, GlobalDep } from './scripts/createMeta';

const GLOBALS: GlobalDep[] = [
	{
		importName: 'fast-average-color',
		globalName: 'FastAverageColor',
		cdnPath: 'https://unpkg.com/fast-average-color@9.4.0/dist/index.browser.js',
	},
	{
		importName: 'loglevel',
		globalName: 'log',
		cdnPath: 'https://unpkg.com/loglevel@1.8.0/lib/loglevel.js',
	},
	{
		importName: 'pixi.js',
		globalName: 'PIXI',
	},
	{
		importName: 'tagpro',
		globalName: 'tagpro',
	},
	{
		importName: 'three',
		globalName: 'THREE',
		// NOTE: THREE.js is moving to ES modules after r160.
		cdnPath: 'https://unpkg.com/three@0.157.0/build/three.min.js',
	},
	{
		importName: 'react',
		globalName: 'React',
		cdnPath: 'https://unpkg.com/react@18.2.0/umd/react.production.min.js',
	},
	{
		importName: 'react-dom',
		globalName: 'ReactDOM',
		cdnPath: 'https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js',
	},
];

const banner = createMeta('./src/meta.ts.ejs', pkg.version, GLOBALS);

const globals: Record<string, string> = {};
for (const dep of GLOBALS) {
	globals[dep.importName] = dep.globalName;
}

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
	external: GLOBALS.map((d) => d.importName),
	plugins: [
		postcss({
			plugins: [prefixer({ prefix: '.tagpro-3d', exclude: ['.tagpro-3d'] })],
			// extract: true,
		}),
		replace({
			'preventAssignment': true,
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
		commonjs(),
		nodeResolve(),
		typescript(),
		copy({
			targets: [{ src: 'assets/', dest: 'docs/' }],
		}),
	],
});
