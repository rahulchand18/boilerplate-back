import globals from 'globals';
import pluginJs from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier'; // Import Prettier plugin

export default [
    {
        languageOptions: {
            globals: {
                ...globals.node, // Include Node.js globals
                process: 'readonly', // Explicitly mark `process` as readonly
                ...globals.browser // Include browser globals if needed
            }
        },
        plugins: {
            prettier: prettierPlugin // Add Prettier as a plugin
        },
        rules: {
            'no-unused-vars': 'error',
            'no-undef': 'error',
            'prettier/prettier': [
                'error',
                {
                    singleQuote: true,
                    trailingComma: 'none',
                    bracketSpacing: true,
                    tabWidth: 4
                }
            ],
            camelcase: 'off'
        }
    },
    pluginJs.configs.recommended
];
