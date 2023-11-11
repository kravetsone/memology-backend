const { configure, presets } = require("eslint-kit");

module.exports = configure({
    allowDebug: process.env.NODE_ENV !== "production",
    extend: {
        rules: {
            "@typescript-eslint/no-empty-interface": "off",
            "no-implicit-coercion": "off",
            "require-atomic-updates": "off",
            "unicorn/explicit-length-check": "off",
            "@typescript-eslint/no-unnecessary-condition": "off", // Bug???
            "comma-dangle": "off",
        },
    },
    presets: [
        presets.imports(),
        presets.node(),
        presets.prettier({
            tabWidth: 4,
            singleQuote: false,
            semi: true,
            endOfLine: "auto",
        }),
        presets.typescript(),
    ],
});
