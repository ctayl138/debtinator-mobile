// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude test files from the production bundle
config.resolver.blockList = [
  /.*\.test\.(ts|tsx)$/,
  /.*\.spec\.(ts|tsx)$/,
];

module.exports = config;
