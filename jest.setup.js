import '@testing-library/react-native/extend-expect';

// Mock expo-font to prevent "loadedNativeFonts.forEach is not a function" error
jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
  useFonts: jest.fn(() => [true, null]),
}));

// Mock @expo/vector-icons to prevent icon loading issues in tests
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  
  const createIconComponent = (name) => {
    const IconComponent = ({ name: iconName, ...props }) => 
      React.createElement(Text, { ...props, testID: `icon-${iconName || name}` }, iconName || name);
    IconComponent.displayName = name;
    return IconComponent;
  };

  return {
    MaterialCommunityIcons: createIconComponent('MaterialCommunityIcons'),
    Ionicons: createIconComponent('Ionicons'),
    FontAwesome: createIconComponent('FontAwesome'),
    createIconSet: jest.fn(() => createIconComponent('CustomIcon')),
  };
});
