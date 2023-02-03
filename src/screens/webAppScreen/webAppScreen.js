import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {
  getDrawerIcon,
  getDrawerNavigationOptions,
} from '../../components/drawer/drawerHelpers';
import styles, {colors} from './webAppStyles';
import WebAppWebView from './webAppWebView';

const getWebAppDrawerIcon = ({tintColor}) => getDrawerIcon('chrome', tintColor);

export const webAppNavOptions = getDrawerNavigationOptions(
  'TS WebApp',
  colors.primary,
  'black',
  getWebAppDrawerIcon,
);

const WebAppStack = createStackNavigator();

const WebAppScreen = () => (
  <WebAppStack.Navigator
    screenOptions={{
      headerMode: 'screen',
      cardStyle: styles.cardStyle,
    }}>
    <WebAppStack.Screen
      name="WebAppWebView"
      component={WebAppWebView}
      options={webAppNavOptions}
    />
  </WebAppStack.Navigator>
);

export default WebAppScreen;
