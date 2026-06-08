module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controller/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**',
  ],
  testMatch: [
    '<rootDir>/__tests__/**/*.test.js',
    '<rootDir>/__tests__/**/*.spec.js',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  verbose: true,
  testTimeout: 10000,
  passWithNoTests: false,
};
