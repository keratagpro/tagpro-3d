import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import * as fs from 'fs/promises';
import prefixer from 'postcss-prefix-selector';
import { defineConfig } from 'rollup';
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';
import serve from 'rollup-plugin-serve';

import pkg from './package.json' assert { type: 'json' };
import { createUserscriptMeta } from './scripts/createUserscriptMeta';

const watchMode = process.env.ROLLUP_WATCH === 'true';

interface GlobalDep {
	importName: string;
	globalName: string;
	cdnPath?: string;
}

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

const metaIncludes = [
	'http://tagpro*.koalabeast.com/game*',
	'https://tagpro*.koalabeast.com/game*',
	'http://tangent.jukejuice.com*',
	'https://tangent.jukejuice.com*',
	'https://bash-tp.github.io/tagpro-vcr/game*.html',
];

if (watchMode) {
	metaIncludes.push('http://localhost:10001*');
}

const header = createUserscriptMeta({
	templateFile: './src/meta.ts.ejs',
	version: pkg.version,
	includes: metaIncludes,
	requires: GLOBALS.reduce((urls: string[], dep) => (dep.cdnPath ? urls.concat(dep.cdnPath) : urls), []),
});

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
			await fs.writeFile('docs/tagpro-3d.meta.js', header, 'utf8');
			return header;
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
			'process.env.NODE_ENV': JSON.stringify('production'), // NOTE: Needed for ReactDOM
		}),
		commonjs(),
		nodeResolve(),
		typescript(),
		copy({
			targets: [{ src: 'assets/', dest: 'docs/' }],
		}),
		watchMode &&
			serve({
				contentBase: ['docs', 'test-page'],
				port: 10001,
			}),
	],
});
