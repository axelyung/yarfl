module.exports = {
    globals: {
        'ts-jest': {
            tsConfigFile: 'tsconfig.test.json',
            skipBabel: true,
        },
    },
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**',
    ],
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node',
    ],
    modulePaths: [
        '<rootDir>',
    ],
    testRegex: '(/__tests__/.*|(\\.|/)(test))\\.(tsx?)$',
    transform: {
        '^.+\\.(t|j)sx?$': 'ts-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!lodash-es)',
    ],
};
