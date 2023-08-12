module.exports = {
	'env': {
		'browser': true,
		'commonjs': true,
		'es6': true,
		'node': true
	},
	'extends': 'eslint:recommended',
	'parserOptions': {
		'ecmaVersion': 2018,
		'sourceType': 'module'
	},
	'globals': {
		'ig': true,
		'sc': true
	},
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'error',
			'windows'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
		'no-empty': [
			'warn' 
		],
		'no-console': [
			'warn'
		]
	}
};