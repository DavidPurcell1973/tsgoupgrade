import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import DynaFormFormScreen from './dynaFormFormScreen';
import DynaFormFormItemScreen from './dynaFormFormItemScreen';
import {
  getDrawerIcon,
  getDrawerNavigationOptions,
} from '../../components/drawer/drawerHelpers';
import styles, {colors} from './dynaFormStyles';

const getDynaFormDrawerIcon = ({tintColor}) =>
  getDrawerIcon('hamburger', tintColor);

export const dynaFormNavOptions = getDrawerNavigationOptions(
  'Dynamic Scan',
  colors.primary,
  'black',
  getDynaFormDrawerIcon,
);

const DynaFormStack = createStackNavigator();

const DynaFormScreen = () => (
  <DynaFormStack.Navigator
    screenOptions={{
      headerMode: 'screen',
      cardStyle: styles.cardStyle,
    }}>
    <DynaFormStack.Screen
      name="DynaFormFormScreen"
      component={DynaFormFormScreen}
      options={dynaFormNavOptions}
    />
    <DynaFormStack.Screen
      name="DynaFormFormItemScreen"
      component={DynaFormFormItemScreen}
      options={dynaFormNavOptions}
    />
  </DynaFormStack.Navigator>
);

export default DynaFormScreen;
