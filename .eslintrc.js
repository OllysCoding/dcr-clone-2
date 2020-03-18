module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'airbnb-typescript',
        'prettier',
        'prettier/@typescript-eslint',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 6,
        project: 'tsconfig.json',
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
        '@typescript-eslint/tslint',
        'react-hooks',
        'dcr',
    ],
    rules: {
        'dcr/only-import-below': [
            'warn',
            {
                allowedImports: [
                    'react',
                    'emotion',
                    'jsdom',
                    'curlyquotes',
                    'react-dom',
                    '@guardian/src-foundations',
                    '@frontend/lib/',
                    '@frontend/amp/lib/',
                    '@frontend/amp/types',
                    '@frontend/static/icons',
                    '@frontend/model',
                    '@frontend/web/',
                    '@testing-library',
                    '@guardian/frontend/static/',
                ],
            },
        ],
        'react/jsx-indent': [2, 4],
        'react/jsx-indent-props': [2, 4],
        'react/prop-types': [0],
        'react/jsx-boolean-value': [2, 'always'],
        'import/prefer-default-export': false,
        '@typescript-eslint/explicit-function-return-type': [0],
        '@typescript-eslint/no-inferrable-types': [0],
        // TODO, review these
        '@typescript-eslint/no-explicit-any': [0],
        'react/jsx-one-expression-per-line': [0],
        'react/no-array-index-key': [0],
        '@typescript-eslint/require-await': [0],
        'array-callback-return': [0],
        'consistent-return': [0],
        'default-case': [0],
        'global-require': [0],
        'import/no-cycle': [0],
        'import/no-extraneous-dependencies': [0],
        'no-case-declarations': [0],
        'no-empty-pattern': [0],
        'no-param-reassign': [0],
        'no-restricted-syntax': [0],
        'no-underscore-dangle': [0],
        'no-useless-escape': [0],
        'react/button-has-type': [0],
        'react/jsx-no-target-blank': [0],
        'react/no-unescaped-entities': [0],
        'react/sort-comp': [0],
        'react/state-in-constructor': [0],
        'react/no-danger': [0],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
        'import/resolver': {
            'babel-module': { extensions: ['.ts', '.tsx', '.js'] },
        },
    },
};
