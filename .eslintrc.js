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
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	// parserOptions: {
	// 	ecmaFeatures: {
	// 		experimentalObjectRestSpread: true,
	// 		jsx: true,
	// 	},
	// 	sourceType: 'module',
	// },
	rules: {
		'linebreak-style': ['error', 'unix'],
		'prefer-rest-params': 'off',
		'quotes': ['error', 'single'],
		'semi': ['error', 'always'],
		'simple-import-sort/imports': 'error',
		'simple-import-sort/exports': 'error',
		'@typescript-eslint/no-non-null-assertion': ['off'],
		'@typescript-eslint/no-unsafe-declaration-merging': 'off',
		'@typescript-eslint/ban-types': 'off',
	},
};
