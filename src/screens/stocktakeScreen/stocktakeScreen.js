import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import StocktakeListScreen from './stocktakeListScreen';
import StocktakeRowScreen from './stocktakeRowScreen';
import StocktakePackScreen from './stocktakePackScreen';
import StocktakeAddRowScreen from './stocktakeAddRowScreen';
import {
  getDrawerIcon,
  getDrawerNavigationOptions,
} from '../../components/drawer/drawerHelpers';
import styles, { colors } from './stocktakeStyles';

const smartScanDrawerIcon = ({ tintColor }) => getDrawerIcon('boxes', tintColor);

export const stocktakeNavOptions = getDrawerNavigationOptions(
  'Stocktake',
  colors.primary,
  'black',
  smartScanDrawerIcon,
);

const StocktakeStack = createStackNavigator();

const StocktakeScreen = () => (
  <StocktakeStack.Navigator screenOptions={{ cardStyle: styles.cardStyle }}>
    <StocktakeStack.Screen
      name="StocktakeList"
      component={StocktakeListScreen}
      options={stocktakeNavOptions}
    />
    <StocktakeStack.Screen
      name="StocktakeRow"
      component={StocktakeRowScreen}
      options={stocktakeNavOptions}
    />
    <StocktakeStack.Screen
      name="StocktakeAddRow"
      component={StocktakeAddRowScreen}
      options={stocktakeNavOptions}
    />
    <StocktakeStack.Screen
      name="StocktakePack"
      component={StocktakePackScreen}
      options={stocktakeNavOptions}
    />
  </StocktakeStack.Navigator>
);

export default StocktakeScreen;
