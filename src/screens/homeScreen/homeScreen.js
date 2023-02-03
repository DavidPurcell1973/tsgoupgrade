import React, {useMemo, useEffect} from 'react';
import {ScrollView, StatusBar, View} from 'react-native';
import {Divider, Text} from 'react-native-elements';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import Config from 'react-native-config';
import {uniqWith} from 'lodash';
import styles, {colors} from './homeScreenStyles';
import {version} from '../../../package.json';
import {
  getDrawerIcon,
  getDrawerNavigationOptions,
} from '../../components/drawer/drawerHelpers';
import {
  apiGetClientApps,
  setShowWebApp,
  updateClientConfigs,
} from '../../reducers/app/appStoreReducer';
import logger from '../../helpers/logger';
import SquareAppButton from '../../components/squareAppButton/squareAppButton';
import GetVersionString from '../../helpers/version';
import {apiUrlSelector} from '../../selectors/common/commonSelector';
import WebApp from '../../components/WebApp';
import AppConfigs from '../../defaults/appConfigs';

const homeDrawerIcon = ({tintColor}) => getDrawerIcon('home', tintColor);

export const homeNavOptions = getDrawerNavigationOptions(
  'Home',
  colors.primary,
  'white',
  homeDrawerIcon,
);

const HomeScreen = () => {
  const dispatch = useDispatch();
  const {appStore} = useSelector((state) => state);
  const {
    apiToken,
    authorizedApps: apps,
    alternativeAppNames,
    username,
    deviceInfo,
  } = appStore;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);

  const memoizedApps = useMemo(() => {
    if (username === 'timbersmart') return apps;
    else return apps;
  }, [apps]);

  const apiGetClientAppsDirect = async () => {
    const url = `${apiUrl || Config.API_URL}/api/auth/getApps`;  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
      });
      dispatch(updateClientConfigs(response.json()));
    } catch (error) {
      logger.error(error);
    }
  };

  const getClientConfigsAsync = async () => {
    try {
      fetch(`${apiUrl || Config.API_URL}/api/auth/getConfigs`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((responseJson) => {
          dispatch(updateClientConfigs(responseJson));
        })
        .catch((error) => {
          logger.error(new Error(error));
        });      
    } catch (error) {
      logger.debug(error);
    }
  };

  useEffect(() => {
    dispatch(apiGetClientApps(apiUrl, apiToken));
    dispatch(setShowWebApp(false));
    getClientConfigsAsync().catch();
  }, []);

  const buildAppButton = (app) => {
    const appConfig = AppConfigs.filter((a) => a.id === app.toLowerCase());
    if (appConfig.length > 0)
      return (
        <SquareAppButton
          key={appConfig[0].id}
          navigateToScreenName={appConfig[0].id}
          iconName={appConfig[0].icon}
          title={alternativeAppNames[appConfig[0].id] || appConfig[0].name}
        />
      );
    return null;
  };

  const uniqWithHandler = (a, b) => a.toLowerCase() === b.toLowerCase();

  return (
    <View style={styles.mainViewContainer}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      {/* <View style={[styles.container, {marginTop: 10, flex: 0}]}>
        <Title style={{fontWeight: 'bold'}}>Choose an app to start</Title>
      </View> */}
      <ScrollView>
        <View style={styles.iconViewContainer}>
          {uniqWith(memoizedApps, uniqWithHandler).map((app) =>
            buildAppButton(app),
          )}
        </View>
      </ScrollView>
      <WebApp />
      <View style={styles.footerContainerStyle}>
        <Divider />
        {/* <Divider style={{backgroundColor: 'blue'}} /> */}
        <Text style={styles.footerTextStyle}>Logged in as {username}</Text>
        <Text style={styles.footerTextStyle}>
          {deviceInfo
            ? // ? ` on ${deviceInfo.androidId - deviceInfo.deviceName}`
              ` Device: ${deviceInfo.androidId}/${deviceInfo.deviceName}`
            : ''}
        </Text>
        <Text style={styles.footerTextStyle}>
          {GetVersionString(version)} © TimberSmart {new Date().getFullYear()}
        </Text>
      </View>
    </View>
  );
};

export default HomeScreen;
