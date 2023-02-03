import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import MergePackToBinScanPackScreen from './mergePackToBinScanPackScreen';
import {
  getDrawerIcon,
  getDrawerNavigationOptions,
} from '../../components/drawer/drawerHelpers';
import styles, { colors } from './mergePackToBinStyles';

const mergePackToBinDrawerIcon = ({ tintColor }) => getDrawerIcon('barcode', tintColor);

export const mergePackToBinNavOptions = getDrawerNavigationOptions(
  'Merge Pack To Bin',
  colors.primary,
  'black',
  mergePackToBinDrawerIcon,
);

const MergeToPackStack = createStackNavigator();

const MergeToPackScreen = () => (
  <MergeToPackStack.Navigator screenOptions={{ cardStyle: styles.cardStyle }}>
    <MergeToPackStack.Screen
      name="MergePackToBinScanPackScreen"
      component={MergePackToBinScanPackScreen}
      options={mergePackToBinNavOptions}
    />
  </MergeToPackStack.Navigator>
);

export default MergeToPackScreen;
