import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import StocktakeListScreen from './stocktakeListScreen';
import StocktakeRowScreen from './stocktakeRowScreen';
import StocktakePackScreen from './stocktakePackScreen';
import StocktakeAddRowScreen from './stocktakeAddRowScreen';
import {
  getDrawerIcon,
  getDrawerNavigationOptions,
} from '../../components/drawer/drawerHelpers';
import styles, {colors} from './stocktakeStyles';

const smartScanDrawerIcon = ({tintColor}) => getDrawerIcon('boxes', tintColor);

export const itiConsignmentStocktakeNavOptions = getDrawerNavigationOptions(
  'Consign. Stocktake',
  colors.primary,
  'black',
  smartScanDrawerIcon,
);

const StocktakeStack = createStackNavigator();

const ITIConsignmentStocktakeScreen = () => (
  <StocktakeStack.Navigator screenOptions={{cardStyle: styles.cardStyle}}>
    <StocktakeStack.Screen
      name="ITIConsignmentStocktakeList"
      component={StocktakeListScreen}
      options={itiConsignmentStocktakeNavOptions}
    />
    <StocktakeStack.Screen
      name="ITIConsignmentStocktakePack"
      component={StocktakePackScreen}
      options={itiConsignmentStocktakeNavOptions}
    />
  </StocktakeStack.Navigator>
);

export default ITIConsignmentStocktakeScreen;
