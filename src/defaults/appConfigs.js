import React from 'react';
import DynaFormScreen, {
  dynaFormNavOptions,
} from '../screens/dynaFormScreen/dynaFormScreen';
import SmartScanScreen, {
  smartScanNavOptions,
} from '../screens/smartScanScreen/smartScanScreen';
import LoadPlanningScreen, {
  loadPlanningNavOptions,
} from '../screens/loadPlanningScreen/loadPlanningScreen';
import OrderPickingScreen, {
  orderPickingNavOptions,
} from '../screens/orderPickingScreen/orderPickingScreen';
import PODScreen, {podNavOptions} from '../screens/podScreen/podScreen';
import WebAppScreen, {
  webAppNavOptions,
} from '../screens/webAppScreen/webAppScreen';
import StocktakeScreen, {
  stocktakeNavOptions,
} from '../screens/stocktakeScreen/stocktakeScreen';
import QuickScanScreen, {
  quickScanNavOptions,
} from '../screens/quickScanScreen/quickScanScreen';
import QuickQueryScreen, {
  quickQueryNavOptions,
} from '../screens/quickQueryScreen/quickQueryScreen';
import ITIConsignmentStocktakeScreen, {
  itiConsignmentStocktakeNavOptions,
} from '../screens/itiConsignmentStocktakeScreen/stocktakeScreen';
import PlaygroundScreen, {
  playgroundNavOptions,
} from '../screens/testAppScreen/playgroundScreen';
import MoistureScreen, {
  moistureNavOptions,
} from '../screens/moistureCollectorScreen/moistureCollectorScreen';

const AppConfigs = [
  {
    id: 'quickquery',
    name: 'Quick Query',
    icon: 'search',
    component: QuickQueryScreen,
    option: quickQueryNavOptions,
  },
  {
    id: 'dynaform',
    name: 'Dynamic Scan',
    icon: 'hamburger',
    component: DynaFormScreen,
    option: dynaFormNavOptions,
  },
  {
    id: 'smartscan',
    name: 'Smart Scan',
    icon: 'barcode',
    component: SmartScanScreen,
    option: smartScanNavOptions,
  },
  {
    id: 'loadpicking',
    name: 'Load Picking',
    icon: 'truck-loading',
    component: LoadPlanningScreen,
    option: loadPlanningNavOptions,
  },
  {
    id: 'orderpicking',
    name: 'Order Picking',
    icon: 'clipboard',
    component: OrderPickingScreen,
    option: orderPickingNavOptions,
  },
  {
    id: 'quickscan',
    name: 'Quick Scan',
    icon: 'th-large',
    component: QuickScanScreen,
    option: quickScanNavOptions,
  },
  {
    id: 'stocktake',
    name: 'Stocktake',
    icon: 'boxes',
    component: StocktakeScreen,
    option: stocktakeNavOptions,
  },
  {
    id: 'iticonsignmentstocktake',
    name: 'Consign. Stocktake',
    icon: 'boxes',
    component: ITIConsignmentStocktakeScreen,
    option: itiConsignmentStocktakeNavOptions,
  },
  {
    id: 'pod',
    name: 'Proof Of Delivery',
    icon: 'dropbox',
    component: PODScreen,
    option: podNavOptions,
  },
  {
    id: 'webapp',
    name: 'WebApp',
    icon: 'internet-explorer',
    component: WebAppScreen,
    option: webAppNavOptions,
  },
  {
    id: 'playground',
    name: 'Playground',
    icon: 'bicycle',
    component: PlaygroundScreen,
    option: playgroundNavOptions,
  },
  {
    id: 'moisture',
    name: 'Moisture',
    icon: 'flask',
    component: MoistureScreen,
    option: moistureNavOptions,
  },
];

export default AppConfigs;
