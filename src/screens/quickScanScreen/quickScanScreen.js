import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import SmartScanTaskScreen from './quickScanTaskScreen';
import QuickScanTaskItemScreen from './quickScanTaskItemScreen';
import {
  getDrawerIcon,
  getDrawerNavigationOptions,
} from '../../components/drawer/drawerHelpers';
import styles, {colors} from './quickScanStyles';

const getQuickScanDrawerIcon = ({tintColor}) =>
  getDrawerIcon('th-large', tintColor);

export const quickScanNavOptions = getDrawerNavigationOptions(
  'Quick Scan',
  colors.primary,
  'black',
  getQuickScanDrawerIcon,
);

const QuickScanStack = createStackNavigator();

const QuickScanScreen = () => (
  <QuickScanStack.Navigator
    screenOptions={{
      headerMode: 'screen',
      cardStyle: styles.cardStyle,
    }}>
    <QuickScanStack.Screen
      name="QuickScanTask"
      component={SmartScanTaskScreen}
      options={quickScanNavOptions}
    />
    <QuickScanStack.Screen
      name="QuickScanTaskItem"
      component={QuickScanTaskItemScreen}
      options={quickScanNavOptions}
    />
  </QuickScanStack.Navigator>
);

export default QuickScanScreen;
