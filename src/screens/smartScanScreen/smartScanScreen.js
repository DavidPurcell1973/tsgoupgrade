import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import SmartScanTaskScreen from './smartScanTaskScreen';
import SmartScanTaskItemScreen from './smartScanTaskItemScreen';
import {
  getDrawerIcon,
  getDrawerNavigationOptions,
} from '../../components/drawer/drawerHelpers';
import styles, { colors } from './smartScanStyles';

const smartScanDrawerIcon = ({ tintColor }) => getDrawerIcon('barcode', tintColor);

export const smartScanNavOptions = getDrawerNavigationOptions(
  'Smart Scan',
  colors.primary,
  'black',
  smartScanDrawerIcon,
);

const SmartScanStack = createStackNavigator();

const SmartScanScreen = () => (
  <SmartScanStack.Navigator
    screenOptions={{ cardStyle: styles.cardStyle }}
    headerMode="screen"
  >
    <SmartScanStack.Screen
      name="SmartScanTask"
      component={SmartScanTaskScreen}
      options={smartScanNavOptions}
    />
    <SmartScanStack.Screen
      name="SmartScanTaskItem"
      component={SmartScanTaskItemScreen}
      options={smartScanNavOptions}
    />
  </SmartScanStack.Navigator>
);

export default SmartScanScreen;
