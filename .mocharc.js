// .mocharc.js
module.exports = {
  require: ['@babel/register'],
  spec: 'tests/**/*.test.mjs', // Corrected path
  reporter: 'spec',
  timeout: 5000,
  'experimental-modules': true, // Add this line
};