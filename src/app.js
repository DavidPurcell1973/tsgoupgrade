import CodePush from 'react-native-code-push';
import packageJson from '../package.json';
import AppCenter from 'appcenter';
import url from 'url';
import React, {Component, useEffect, useState,  Node} from 'react';
import Geolocation from 'react-native-geolocation-service';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer, DrawerActions} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  ToastAndroid,
  View,
} from 'react-native';
import SignInScreen, {
  signInScreenOptions,
} from './screens/coreScreen/signInScreen';
import Drawer from './components/drawer/drawer';
import LoadingScreen from './screens/coreScreen/loadingScreen';
import styles, {colors} from './styles/styles';
import SettingsScreen, {
  settingsScreenOptions,
} from './screens/coreScreen/settingsScreen';
import OfflineQueueScreen, {
  offlineQueueNavOptions,
} from './screens/coreScreen/offlineQueueScreen';
import {navigationRef} from './RootNavigation';
import DrawerItem from './components/drawer/drawerItem';

import {
  setWebAppFullScreen,
  setWebAppRefresh,
  toggleDebugOption,
  updateDeviceInfo,
} from './reducers/app/appStoreReducer';
import {baseAutoUpdate, otaCodePushAutoUpdate} from './helpers/autoUpdate';
import {displayToast} from './helpers/utils';
import logger from './helpers/logger';
import PayloadSource from './helpers/PayloadSource';
import {isArray, isString, isObject} from 'lodash';
import PayloadAction from './helpers/PayloadAction';
import {renewTokenService} from './helpers/tokenService';
import {apiUrlSelector} from './selectors/common/commonSelector';
import WebAppScreen, {
  webAppNavOptions,
} from './screens/webAppScreen/webAppScreen';
import { RootSiblingParent } from 'react-native-root-siblings';

const RootStack = createStackNavigator();

const hasLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    const hasPermission = await hasPermissionIOS();
    return hasPermission;
  }

  if (Platform.OS === 'android' && Platform.Version < 23) {
    return true;
  }

  const hasPermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (status === PermissionsAndroid.RESULTS.GRANTED) {
    logger.info('Has location permission.');
    return true;
  }

  if (status === PermissionsAndroid.RESULTS.DENIED) {
    ToastAndroid.show('Location permission denied by user.', ToastAndroid.LONG);
    logger.info('Location permission denied by user.');
  } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    logger.info('Location permission revoked by user.');
    ToastAndroid.show(
      'Location permission revoked by user.',
      ToastAndroid.LONG,
    );
  }

  return false;
};

// https://github.com/microsoft/react-native-code-push/blob/master/docs/api-js.md
const syncOptions = {
  updateDialog: true,
  checkFrequency: CodePush.CheckFrequency.MANUAL,
  installMode: CodePush.InstallMode.IMMEDIATE,
  mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
};

/* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
 * LTI update could not be added via codemod */
const App = () => {
  const dispatch = useDispatch();
  const {appStore, offline} = useSelector((state) => state);
  const {
    isAutoUpdateEnabled,
    isAuthenticated,
    isLoading,
    drawerTitle,
    isBetaEnabled,
    isWebAppVisible,
    isWebAppFullScreen,
    tokenExpireAt,
    username,
    deviceInfo,
  } = appStore;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const [updatedOnce, setUpdatedOnce] = useState(false);
  const [forceLocation, setForceLocation] = useState(true);
  const [highAccuracy, setHighAccuracy] = useState(true);
  const [locationDialog, setLocationDialog] = useState(true);
  const [significantChanges, setSignificantChanges] = useState(false);
  const [observing, setObserving] = useState(false);
  const [foregroundService, setForegroundService] = useState(false);
  const [useLocationManager, setUseLocationManager] = useState(false);
  const {outbox} = offline;

  const isTokenExpired = () => moment().isAfter(moment(tokenExpireAt));

  const checkQueue = () => {
    let message = 'Unknown queue status';
    if (isArray(outbox)) {
      if (outbox.length > 5) {
        message = `More than 5 messages pending (${outbox.length}) - is the network okay?`;
      } else {
        message = `${outbox.length} requests pending in queue`;
      }
    }
    // console.log(message);
    displayToast(message);
  };

  const maximizeWebApp = () => {
    dispatch(setWebAppFullScreen(isWebAppFullScreen ? 'false' : 'true'));
  };

  const checkToken = () => {
    if (isTokenExpired()) {
      logger.info('Token has expired (Manual). Forcing a renew...', {
        source: PayloadSource.Core,
        action: PayloadAction.Renew,
      });
      renewTokenService(true).finally();
    } else {
      displayToast('Token is current!');
      console.log('Token is current!');
    }
  };

  const isQueueEmpty = () => outbox.length === 0;

  const announceMyselfToLogger = async () => {
    const parsedUrl = url.parse(apiUrl);
    const message = `I am ${username || '(anonymous)'}${
      isObject(parsedUrl) && ' connected to ' + parsedUrl.hostname
    }`;
    logger.info(message, {
      username,
      ...deviceInfo,
      appVersion: packageJson.version,
      commit: packageJson.commit,
      shortCommit: packageJson.commit.slice(0, 8),
    });
    logger.info(message);
  };

  const getDeviceLocation = async () => {
    const hasPermission = await hasLocationPermission();

    if (hasPermission) {
      Geolocation.getCurrentPosition(
        (position) => {
          dispatch(updateDeviceInfo(position));
          logger.info(`Got device location ${JSON.stringify(position)}`);
        },
        (error) => {
          // See error code charts below.
          console.log(error.code, error.message);
        },
        {
          accuracy: {
            android: 'high',
            ios: 'best',
          },
          enableHighAccuracy: highAccuracy,
          timeout: 15000,
          maximumAge: 10000,
          distanceFilter: 0,
          forceRequestLocation: forceLocation,
          forceLocationManager: useLocationManager,
          showLocationDialog: locationDialog,
        },
      );
    } else {
      await logger.info(`Device does not have location permission.`);
    }
  };

  

  const AppCenter = async () => {
    // await AppCenter.Analytics.setEnabled(true);
    await AppCenter.setNetworkRequestsAllowed(true);
    logger.info(`AppCenter is ${await AppCenter.isEnabled()}`);
    logger.info(`AppCenter SDK is ${AppCenter.getSdkVersion()}`);
    logger.info(
      `AppCenter NetworkRequestAllowed is ${await AppCenter.isNetworkRequestsAllowed()}`,
    );
  };

  useEffect(() => {
    
    (async () => {
      DeviceInfo.getDeviceName().then((deviceName) => {
        dispatch(updateDeviceInfo({deviceName}));
      });

      DeviceInfo.getAndroidId().then((androidId) => {
        dispatch(updateDeviceInfo({androidId}));
        AppCenter.setUserId(androidId);
      });

      DeviceInfo.getSerialNumber().then((serialNumber) => {
        dispatch(updateDeviceInfo({serialNumber}));
      });

      DeviceInfo.getMacAddress().then((macAddress) => {
        dispatch(updateDeviceInfo({macAddress}));
      });

      await getDeviceLocation();
      await announceMyselfToLogger();
      await AppCenter();
    })();

    setTimeout(() => {
      // Delay auto update to make sure the store has been restored
      setUpdatedOnce(true);
    }, 2000);
  }, []);

  useEffect(() => {
    if (updatedOnce) {
      logger.debug(`Is OTA enabled? ${isAutoUpdateEnabled}`);
      if (isAutoUpdateEnabled) {
        logger.debug(`Is Beta enabled? ${isBetaEnabled}`);
        const env = isBetaEnabled ? 'staging' : 'production';
        // https://github.com/microsoft/react-native-code-push#getting-started
        otaCodePushAutoUpdate(env);
      }
      if (isAutoUpdateEnabled && isAutoUpdateEnabled !== 'undefined') {
        // baseAutoUpdate();
      }
    }
  }, [updatedOnce]);

  return (
    <RootSiblingParent>
      <NavigationContainer ref={navigationRef}>
        <RootStack.Navigator
          screenOptions={({navigation, route}) => ({
            headerMode: 'screen',
            title: drawerTitle,
            // cardStyle: styles.cardStyle,
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTitleStyle: {
              color: 'white',
              fontWeight: 'bold',
            },
            headerTintColor: colors.primary,
          })}>
          {/* eslint-disable-next-line no-nested-ternary */}
          {isAuthenticated && !isLoading ? (
            <RootStack.Screen
              name="Drawer"
              component={Drawer}
              options={({navigation, route}) => ({
                headerLeft: () => (
                  <DrawerItem
                    iconName="bars"
                    onLongPress={() => {
                      dispatch(toggleDebugOption());
                    }}
                    onPress={() => {
                      navigation.dispatch(DrawerActions.toggleDrawer());
                    }}
                  />
                ),
                headerRight: () => (
                  <View
                    style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                    {isWebAppVisible ? (
                      <>
                        <Icon
                          size={30}
                          color="white"
                          style={{marginRight: 5}}
                          name="sync"
                          onPress={() => {
                            dispatch(setWebAppRefresh(true));
                          }}
                        />
                        <Icon
                          size={30}
                          color="white"
                          style={{marginRight: 5}}
                          onPress={() => maximizeWebApp()}
                          name={
                            isWebAppFullScreen
                              ? 'window-minimize'
                              : 'window-maximize'
                          }
                        />
                      </>
                    ) : null}
                    <Icon
                      size={30}
                      color={outbox.length > 5 ? 'red' : 'white'}
                      style={{marginRight: 5}}
                      name={!isQueueEmpty() ? 'inbox-arrow-up' : 'inbox'}
                      onPress={() => checkQueue()}
                    />
                    <Icon
                      size={30}
                      color={isTokenExpired() ? 'red' : 'white'}
                      onPress={() => checkToken()}
                      style={{marginRight: 10}}
                      name={
                        outbox && isTokenExpired()
                          ? 'emoticon-dead'
                          : 'emoticon-excited-outline'
                      }
                    />
                  </View>
                ),
                animationEnabled: true,
              })}
            />
          ) : !isLoading ? (
            <>
              <RootStack.Screen
                name="SignIn"
                component={SignInScreen}
                options={signInScreenOptions}
              />
              <RootStack.Screen
                name="Settings"
                component={SettingsScreen}
                options={settingsScreenOptions}
              />
              <RootStack.Screen
                name="OfflineQueue"
                component={OfflineQueueScreen}
                options={offlineQueueNavOptions}
              />
              <RootStack.Screen
                name="WebApp"
                component={WebAppScreen}
                options={webAppNavOptions}
              />
            </>
          ) : (
            <RootStack.Screen
              name="Loading"
              component={LoadingScreen}
              options={({navigation, route}) => ({
                headerLeft: () => (
                  <DrawerItem iconName="bars" onPress={() => {}} />
                ),
                // animationEnabled: false,
              })}
            />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </RootSiblingParent>
  );
};

// App.defaultProps = {
//   isAuthenticated: false,
//   drawerTitle: 'Loading',
//   isLoading: false,
// };
//
// App.propTypes = {
//   isAuthenticated: PropTypes.bool,
//   isAutoUpdateEnabled: PropTypes.bool,
//   isLoading: PropTypes.bool,
//   drawerTitle: PropTypes.string,
//   toggleDebugOption: PropTypes.func.isRequired,
// };

export default CodePush(syncOptions)(App);
