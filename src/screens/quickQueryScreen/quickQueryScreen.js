import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import QuickQueryListScreen from './quickQueryListScreen';
import {
  getDrawerIcon,
  getDrawerNavigationOptions,
} from '../../components/drawer/drawerHelpers';
import styles, {colors} from './quickQueryStyles';
import QuickQueryTaskScreen from './quickQueryTaskScreen';

const getQuickQueryDrawerIcon = ({tintColor}) =>
  getDrawerIcon('search', tintColor);

export const quickQueryNavOptions = getDrawerNavigationOptions(
  'Quick Query',
  colors.primary,
  'black',
  getQuickQueryDrawerIcon,
);

const QuickQueryStack = createStackNavigator();

const QuickQueryScreen = () => (
  <QuickQueryStack.Navigator
    screenOptions={{
      headerMode: 'screen',
      cardStyle: styles.cardStyle,
    }}>
    <QuickQueryStack.Screen
      name="QuickQueryListScreen"
      component={QuickQueryListScreen}
      options={quickQueryNavOptions}
    />
    <QuickQueryStack.Screen
      name="QuickQueryTaskScreen"
      component={QuickQueryTaskScreen}
      options={quickQueryNavOptions}
    />
  </QuickQueryStack.Navigator>
);

export default QuickQueryScreen;
