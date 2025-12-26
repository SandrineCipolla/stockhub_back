module.exports = {
  extends: ['../.eslintrc.cjs'],
  rules: {
    // Allow 'any' in tests for mocks and test utilities
    '@typescript-eslint/no-explicit-any': 'off',
    // Allow console.log in tests for debugging
    'no-console': 'off',
  },
};
