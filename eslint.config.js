import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import-x';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{ ignores: [ 'dist' ] },
	{
		files: [ '**/*.{ts,tsx,js,jsx}' ],
		extends: [
			js.configs.recommended,
		],
		languageOptions: {
			ecmaVersion: 2022,
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			'react': react,
			'import': importPlugin,
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{
					allowConstantExport: true,
					extraHOCs: [ 'withTranslation' ]
				},
			],
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			'linebreak-style': [ 'error', 'unix' ],
			'semi': [ 'error', 'always' ],
			'array-bracket-spacing': [ 'error', 'always' ],
			'brace-style': [ 'error', '1tbs' ],
			'camelcase': 'error',
			'comma-dangle': [ 'error', 'always-multiline' ],
			'comma-spacing': 'error',
			'comma-style': 'error',
			'computed-property-spacing': [ 'error', 'always' ],
			'constructor-super': 'error',
			'consistent-return': 'off',
			'curly': 'error',
			'dot-notation': 'error',
			'eqeqeq': [ 'error', 'allow-null' ],
			'eol-last': 'error',
			'func-call-spacing': 'error',
			'indent': [ 'error', 'tab', { 'SwitchCase': 1 } ],
			'jsx-quotes': [ 'error', 'prefer-double' ],
			'key-spacing': 'error',
			'keyword-spacing': 'error',
			'max-len': [ 'error', { 'code': 105 } ],
			'new-cap': [ 'error', { 'capIsNew': false, 'newIsCap': true } ],
			'no-cond-assign': 'error',
			'no-const-assign': 'error',
			'no-console': 'warn',
			'no-debugger': 'error',
			'no-dupe-args': 'error',
			'no-dupe-keys': 'error',
			'no-duplicate-case': 'error',
			'no-duplicate-imports': 'error',
			'no-else-return': 'error',
			'no-empty': [ 'error', { 'allowEmptyCatch': true } ],
			'no-extra-semi': 'error',
			'no-fallthrough': 'off',
			'no-lonely-if': 'error',
			'no-mixed-spaces-and-tabs': 'error',
			'no-multiple-empty-lines': [ 'error', { 'max': 1 } ],
			'no-multi-spaces': 'error',
			'no-nested-ternary': 'error',
			'no-new': 'error',
			'no-redeclare': 'error',
			'no-shadow': 'error',
			'no-trailing-spaces': 'error',
			'no-undef': 'error',
			'no-underscore-dangle': 'off',
			'no-unreachable': 'error',
			'no-unused-vars': [
				'error',
				{
					'varsIgnorePattern': '^React$'
				}
			],
			'no-var': 'error',
			'object-curly-spacing': [ 'error', 'always' ],
			'one-var': 'off',
			'operator-linebreak': [
				'error',
				'after',
				{
					'overrides': {
						'?': 'before',
						':': 'before'
					}
				}
			],
			'padded-blocks': [ 'error', 'never' ],
			'prefer-const': 'error',
			'quote-props': [ 'error', 'as-needed' ],
			'quotes': [ 'error', 'single', 'avoid-escape' ],
			'semi-spacing': 'error',
			'space-before-blocks': [ 'error', 'always' ],
			'space-before-function-paren': [
				'error',
				{
					'anonymous': 'never',
					'asyncArrow': 'always',
					'named': 'never'
				}
			],
			'space-in-parens': [ 'error', 'always' ],
			'space-infix-ops': [ 'error', { 'int32Hint': false } ],
			'space-unary-ops': [
				'error',
				{
					'overrides': {
						'!': true
					}
				}
			],
			'react/jsx-curly-spacing': [ 2, 'always' ],
			'react/jsx-no-duplicate-props': 2,
			'react/jsx-no-target-blank': 2,
			'react/jsx-no-undef': 2,
			'react/jsx-tag-spacing': 2,
			'react/jsx-uses-vars': 2,
			'react/no-danger': 2,
			'react/no-deprecated': 2,
			'react/prefer-es6-class': 2,
			'import/order': [
				'error',
				{
					'groups': [ 'builtin', 'external', 'parent', 'sibling', 'index' ],
					'newlines-between': 'always',
					'alphabetize': {
						'order': 'asc',
						'caseInsensitive': true
					}
				}
			],
		},
	},
	{
		files: [ '**/*.{ts,tsx}' ],
		extends: [
			...tseslint.configs.recommended,
		],
		languageOptions: {
			parserOptions: {
				project: [ './tsconfig.json', './tsconfig.node.json' ],
				tsconfigRootDir: import.meta.dirname,
			},
		},
		settings: {
			'import/resolver': {
				typescript: {
					project: [ './tsconfig.json', './tsconfig.node.json' ],
				},
			},
		},
		rules: {
			'@typescript-eslint/no-unused-vars': [ 'error' ],
			'@typescript-eslint/no-explicit-any': 'warn',
		},
	},
	prettier,
);
