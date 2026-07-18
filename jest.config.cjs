const {pathsToModuleNameMapper} = require('ts-jest');
const {compilerOptions} = require('./tsconfig.json');

module.exports = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    testMatch: ["<rootDir>/**/*.test.*"],
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    transform: {'^.+\\.[tj]sx?$': ['ts-jest', {useESM: true}]},
    moduleDirectories: ['node_modules', '<rootDir>/src'],
    testPathIgnorePatterns: [
        ".venv/test.js"
    ],
    verbose: false
};
