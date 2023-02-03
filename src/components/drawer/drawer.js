import React, {useMemo} from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {useDispatch, useSelector} from 'react-redux';
import {isObject, isString, uniqWith} from 'lodash';
import styles, {colors} from './drawerStyles';
import HomeScreen, {homeNavOptions} from '../../screens/homeScreen/homeScreen';
import {CustomDrawerContent} from './drawerHelpers';
import AppConfigs from '../../defaults/appConfigs';
import OfflineQueueScreen, {
  offlineQueueNavOptions,
} from '../../screens/coreScreen/offlineQueueScreen';
import DebugScreen, {
  debugNavOptions,
} from '../../screens/coreScreen/debugScreen';
import SettingsScreen, {
  settingsScreenOptions,
} from '../../screens/coreScreen/settingsScreen';
import logger from '../../helpers/logger';

const DrawerNavigator = createDrawerNavigator();

const Drawer = () => {
  const {appStore} = useSelector((state) => state);
  const {authorizedApps: apps, username, showDebugOption} = appStore;
  const memoizedApps = useMemo(() => {
    if (showDebugOption && isString(username) && username === 'timbersmart') {
      return [...apps, 'playground'];
    }
    return apps;
  }, [apps]);

  const buildAppMenu = (app) => {
    const appConfigs = AppConfigs.filter((a) => a.id === app.toLowerCase());
    if (appConfigs.length === 1) {
      const currentApp = appConfigs[0];
      return (
        <DrawerNavigator.Screen
          key={currentApp.id}
          name={currentApp.id}
          component={currentApp.component}
          options={currentApp.option}
        />
      );
    }
    // logger.warn('Server provided an unknown app: ' + app.toLowerCase());
    return null;
  };

  const uniqWithHandler = (a, b) => a.toLowerCase() === b.toLowerCase();

  return (
    <DrawerNavigator.Navigator
      drawerPosition="left"
      drawerType="slide"
      drawerStyle={styles.drawerStyle}
      sceneContainerStyle={styles.sceneContainerStyle}
      screenOptions={({navigation, route}) => ({
        activeTintColor: colors.primary,
        labelStyle: styles.drawerLabelStyle,
        cardStyle: styles.cardStyle,
        animationEnabled: true,
        // itemStyle: { borderWidth: 1, borderColor: 'blue'},
      })}
      // drawerContentOptions={{
      //   activeTintColor: colors.primary,
      //   labelStyle: styles.drawerLabelStyle,
      //   // itemStyle: { borderWidth: 1, borderColor: 'blue'},
      // }}
      // options={{}}
      drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <DrawerNavigator.Screen
        name="Home"
        component={HomeScreen}
        options={homeNavOptions}
      />
      {uniqWith(memoizedApps, uniqWithHandler).map((app) => buildAppMenu(app))}
      <DrawerNavigator.Screen
        name="Settings"
        component={SettingsScreen}
        options={settingsScreenOptions}
      />
      <DrawerNavigator.Screen
        name="Queue"
        component={OfflineQueueScreen}
        options={offlineQueueNavOptions}
      />
      {showDebugOption ? (
        <DrawerNavigator.Screen
          name="Debug"
          component={DebugScreen}
          options={debugNavOptions}
        />
      ) : null}
    </DrawerNavigator.Navigator>
  );
};

export default Drawer;
