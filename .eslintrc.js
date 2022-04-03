/** @type {import('eslint').Linter.Config} */
module.exports = {
	root: true,
	env: {
		browser: true,
		commonjs: true,
		es6: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'simple-import-sort'],
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	// parserOptions: {
	// 	ecmaFeatures: {
	// 		experimentalObjectRestSpread: true,
	// 		jsx: true,
	// 	},
	// 	sourceType: 'module',
	// },
	rules: {
		'simple-import-sort/imports': 'error',
		'simple-import-sort/exports': 'error',
		'prefer-rest-params': 'warn',
		'linebreak-style': ['error', 'windows'],
		quotes: ['error', 'single'],
		semi: ['error', 'always'],
		'@typescript-eslint/indent': ['error', 'tab'],
		'@typescript-eslint/no-non-null-assertion': 0,
		'@typescript-eslint/no-var-requires': 0,
	},
	globals: {
		overrideableAssets: true,
		GM_getResourceURL: true,
	},
};
