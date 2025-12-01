const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// React import 문제 해결을 위한 설정
config.resolver.alias = {
  'react': require.resolve('react'),
  'react-native': require.resolve('react-native'),
};

module.exports = config;



















