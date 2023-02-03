import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import MoistureCollectorSomethingScreen from './moistureCollectorSomethingScreen';
import MoistureReviewScreen from './moistureReviewScreen';
import MoistureConfigScreen from './moistureConfigScreen';
//import SmartScanTaskItemScreen from './smartScanTaskItemScreen';
import {
  getDrawerIcon,
  getDrawerNavigationOptions,
} from '../../components/drawer/drawerHelpers';
import {styles, colors } from './moistureCollectorStyles';

const moistureDrawerIcon = ({ tintColor }) => getDrawerIcon('flask', tintColor);

export const moistureNavOptions = getDrawerNavigationOptions(
  'Moisture',
  colors.primary,
  'black',
  moistureDrawerIcon,
);

const MoistureStack = createStackNavigator();

export const MoistureScreen = () => (
  <MoistureStack.Navigator
    screenOptions={{ cardStyle: styles.cardStyle }}
    headerMode="screen"
  >
    <MoistureStack.Screen
      name="MoistureSomething"
      component={MoistureCollectorSomethingScreen}
      options={moistureNavOptions}
    />
    <MoistureStack.Screen
      name="MoistureReviewScreen"
      component={MoistureReviewScreen}
      options={moistureNavOptions}
    />
    <MoistureStack.Screen
      name="MoistureConfigScreen"
      component={MoistureConfigScreen}
      options={moistureNavOptions}
    />
  </MoistureStack.Navigator>
);

export default MoistureScreen;