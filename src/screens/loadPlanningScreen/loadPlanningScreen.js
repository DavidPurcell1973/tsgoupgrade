import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import LoadPlanningLoadScreen from './loadPlanningLoadScreen';
import LoadPlanningLoadItemScreen from './loadPlanningLoadItemScreen';
import LoadPlanningLoadItemAutoScanMatchScreen from './loadPlanningLoadItemAutoScanMatchScreen';
import LoadPlanningLoadItemPackListScreen from './loadPlanningLoadItemPackListScreen';
import LoadPlanningLoadItemScanPackScreen from './loadPlanningLoadItemScanPackScreen';
import LoadPlanningLoadItemSplitPackScreen from './loadPlanningLoadItemSplitPackScreen';
import {
  getDrawerIcon,
  getDrawerNavigationOptions,
} from '../../components/drawer/drawerHelpers';
import styles, {colors} from './loadPlanningStyles';
import LoadPlanningLoadVerificationScreen from './loadPlanningLoadVerificationScreen';

const loadPlanningDrawerIcon = ({tintColor}) =>
  getDrawerIcon('truck-loading', tintColor);

export const loadPlanningNavOptions = getDrawerNavigationOptions(
  'Load Picking',
  colors.primary,
  'black',
  loadPlanningDrawerIcon,
);

const LoadPlanningStack = createStackNavigator();

const LoadPlanningScreen = () => (
  <LoadPlanningStack.Navigator screenOptions={{cardStyle: styles.cardStyle}}>
    <LoadPlanningStack.Screen
      name="LoadPlanningLoad"
      component={LoadPlanningLoadScreen}
      options={loadPlanningNavOptions}
    />
    <LoadPlanningStack.Screen
      name="LoadPlanningLoadItem"
      component={LoadPlanningLoadItemScreen}
      options={loadPlanningNavOptions}
    />
    <LoadPlanningStack.Screen
      name="LoadPlanningLoadItemPackList"
      component={LoadPlanningLoadItemPackListScreen}
      options={loadPlanningNavOptions}
    />
    <LoadPlanningStack.Screen
      name="LoadPlanningLoadItemAutoScanMatch"
      component={LoadPlanningLoadItemAutoScanMatchScreen}
      options={loadPlanningNavOptions}
    />
    <LoadPlanningStack.Screen
      name="LoadPlanningLoadItemScanPack"
      component={LoadPlanningLoadItemScanPackScreen}
      options={loadPlanningNavOptions}
    />
    <LoadPlanningStack.Screen
      name="LoadPlanningLoadItemSplitPack"
      component={LoadPlanningLoadItemSplitPackScreen}
      options={loadPlanningNavOptions}
    />
    <LoadPlanningStack.Screen
      name="LoadPlanningLoadVerification"
      component={LoadPlanningLoadVerificationScreen}
      options={loadPlanningNavOptions}
    />
  </LoadPlanningStack.Navigator>
);

export default LoadPlanningScreen;
