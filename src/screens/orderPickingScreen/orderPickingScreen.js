import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import {
  getDrawerIcon,
  getDrawerNavigationOptions,
} from '../../components/drawer/drawerHelpers';
import OrderPickingOrderScreen from './orderPickingOrderScreen';
import OrderPickingOrderItemScreen from './orderPickingOrderItemScreen';
import OrderPickingOrderItemScanPackScreen from './orderPickingOrderItemScanPackScreen';
import OrderItemOrderItemPackListScreen from './orderPickingOrderItemPackListScreen';
import orderPickingOrderItemSplitPackScreen from './orderPickingOrderItemSplitPackScreen';
import styles, { colors } from './orderPickingStyles';

const orderPickingDrawerIcon = ({ tintColor }) => getDrawerIcon('clipboard-list', tintColor);

export const orderPickingNavOptions = getDrawerNavigationOptions(
  'Order Picking',
  colors.primary,
  'black',
  orderPickingDrawerIcon,
);

const OrderPickingStack = createStackNavigator();

const OrderPickingScreen = () => (
  <OrderPickingStack.Navigator screenOptions={{ cardStyle: styles.cardStyle }}>
    <OrderPickingStack.Screen
      name="OrderPickingOrder"
      component={OrderPickingOrderScreen}
      options={orderPickingNavOptions}
    />
    <OrderPickingStack.Screen
      name="OrderPickingOrderItem"
      component={OrderPickingOrderItemScreen}
      options={orderPickingNavOptions}
    />
    <OrderPickingStack.Screen
      name="OrderPickingOrderItemScanPack"
      component={OrderPickingOrderItemScanPackScreen}
      options={orderPickingNavOptions}
    />
    <OrderPickingStack.Screen
      name="OrderItemOrderItemPackList"
      component={OrderItemOrderItemPackListScreen}
      options={orderPickingNavOptions}
    />
    <OrderPickingStack.Screen
      name="OrderPickingOrderItemSplitPack"
      component={orderPickingOrderItemSplitPackScreen}
      options={orderPickingNavOptions}
    />
  </OrderPickingStack.Navigator>
);

export default OrderPickingScreen;
