// prettier-ignore

module.exports = {
	"extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
	"root": true,
	"ignorePatterns": ["build/", "node_modules/"],
	"env": {
		"browser": true,
		"es2017": true,
		"node": true
	},
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"sourceType": "module",
		"ecmaVersion": 2020
	},
	"plugins": ["@typescript-eslint"],
	"rules": {
		"comma-style": ["warn", "last"],
		"dot-notation": "warn",
		"eqeqeq": ["error", "always"],
		"func-call-spacing": ["warn", "never"],
		"lines-between-class-members": ["warn", "always", { "exceptAfterSingleLine": true }],
		"no-cond-assign": ["error", "always"],
		"no-console": "off",
		"no-multi-spaces": "warn",
		"no-prototype-builtins": "off",
		"no-shadow": "off",
		"no-trailing-spaces": "warn",
		"no-var": "error",
		"padded-blocks": ["warn", "never"],
		"prefer-const": "warn",
		"prefer-rest-params": "warn",
		"space-infix-ops": "error",
		"spaced-comment": ["warn", "always", {
			"line": {
				"markers": ["/"]
			},
			"block": {
				"balanced": true
			}
		}],
		"yoda": ["warn", "never"],
		"@typescript-eslint/no-empty-interface": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-inferrable-types": "off",
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/no-shadow": "error",
		"@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
		"@typescript-eslint/no-var-requires": "off",
	}
}
