import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import {
  getDrawerIcon,
  getDrawerNavigationOptions,
} from '../../components/drawer/drawerHelpers';
import styles, { colors } from './podStyles';
import PODLoadsScreen from './podLoadsScreen';
import PODLoadDespatchesScreen from './podLoadDespatchesScreen';
import PODDespatchReviewScreen from './podDespatchReviewScreen';
import PODCaptureSignatureScreen from './podCaptureSignatureScreen';
import PODCapturePhotoScreen from './podCapturePhotoScreen';

const podDrawerIcon = ({ tintColor }) => getDrawerIcon('dropbox', tintColor);

export const podNavOptions = getDrawerNavigationOptions(
  'POD',
  colors.primary,
  'black',
  podDrawerIcon,
);

const PODStack = createStackNavigator();

const PODScreen = () => (
  <PODStack.Navigator
    screenOptions={{ 
    headerMode: 'screen',
      cardStyle: styles.cardStyle }}
  >
    <PODStack.Screen
      name="PODLoadsScreen"
      component={PODLoadsScreen}
      options={podNavOptions}
    />
    <PODStack.Screen
      name="PODLoadDespatchesScreen"
      component={PODLoadDespatchesScreen}
      options={podNavOptions}
    />
    <PODStack.Screen
      name="PODDespatchReviewScreen"
      component={PODDespatchReviewScreen}
      options={podNavOptions}
    />
    <PODStack.Screen
      name="PODCaptureSignatureScreen"
      component={PODCaptureSignatureScreen}
      options={podNavOptions}
    />
    <PODStack.Screen
      name="PODCapturePhotoScreen"
      component={PODCapturePhotoScreen}
      options={podNavOptions}
    />
  </PODStack.Navigator>
);

export default PODScreen;
