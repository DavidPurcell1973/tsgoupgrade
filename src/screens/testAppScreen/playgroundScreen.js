import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {
  getDrawerIcon,
  getDrawerNavigationOptions,
} from '../../components/drawer/drawerHelpers';
import PlaygroundLandingScreen from './playgroundLandingScreen';
import styles, {colors} from './playgroundStyles';

const getPlaygroundDrawerIcon = ({tintColor}) =>
  getDrawerIcon('bicycle', tintColor);

export const playgroundNavOptions = getDrawerNavigationOptions(
  'Playground',
  colors.primary,
  'black',
  getPlaygroundDrawerIcon,
);

const PlaygroundStack = createStackNavigator();

const PlaygroundScreen = () => (
  <PlaygroundStack.Navigator
    screenOptions={{
      headerMode: 'screen',
      cardStyle: styles.cardStyle,
    }}>
    <PlaygroundStack.Screen
      name="PlaygroundLandingScreen"
      component={PlaygroundLandingScreen}
      options={playgroundNavOptions}
    />
  </PlaygroundStack.Navigator>
);

export default PlaygroundScreen;
