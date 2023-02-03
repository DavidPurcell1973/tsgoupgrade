import React, {useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import fetch from 'node-fetch';
import {Icon, Text, ListItem, Button} from 'react-native-elements';
import {View, ScrollView} from 'react-native';
import DialogAndroid from 'react-native-dialogs';
import {RESET_STATE} from '@redux-offline/redux-offline/lib/constants';
import {isString, isEmpty, isArray} from 'lodash';
import fs from 'react-native-fs';
import {format} from 'date-fns';
import urlcat from 'urlcat';
import {useNavigation} from '@react-navigation/native';
import {
  getDrawerIcon,
  getDrawerNavigationOptions,
} from '../../components/drawer/drawerHelpers';
import styles, {colors} from './settingsStyles';
import {
  resetStore,
  setWebAppEnabled,
  setWebAppPrioritised,
  toggleAutoUpdate,
  toggleBetaChannel,
  toggleSeqLogging,
  updateApiUrl,
  updateSelectedSiteEndpoint,
  updateSiteEndpoints,
  updateWebAppUrl,
} from '../../reducers/app/appStoreReducer';
import logger from '../../helpers/logger';
import {
  displayDialogWithOptions,
  displayToast,
  saveDataStringAsync,
} from '../../helpers/utils';
import {otaCodePushAutoUpdate} from '../../helpers/autoUpdate';

const settingsDrawerIcon = ({tintColor}) =>
  getDrawerIcon('gear', tintColor, 'FontAwesome');

export const settingsScreenOptions = getDrawerNavigationOptions(
  'Settings',
  colors.primary,
  'white',
  settingsDrawerIcon,
);

const SettingsScreen = () => {
  const store = useSelector((state) => state);
  const {appStore, offline} = store;
  const navigation = useNavigation();
  const {online} = offline;
  const memoizedAppStore = useMemo(() => appStore, [store]);
  const {
    apiUrl,
    isWebAppEnabled,
    isWebAppPrioritised,
    isAutoUpdateEnabled,
    isBetaEnabled,
    seqLoggingEnabled,
    selectedSiteEndpoint,
    selectedSiteName,
    siteEndpoints,
    isAuthenticated,
    webAppUrl,
  } = memoizedAppStore;

  const dispatch = useDispatch();
  const [showNetworkDebugTests, setShowNetworkDebugTests] = useState(false);
  const [dummyResponse, setDummyResponse] = useState({});
  const [dummyResponseInMs, setDummyResponseInMs] = useState(0);
  const [dummyApiResponse, setDummyApiResponse] = useState({});
  const [dummyApiResponseInMs, setDummyApiResponseInMs] = useState({});

  const handleDummyAPIRequest = async (type = 1) => {
    setDummyApiResponse({...dummyApiResponse, [type]: {}});
    setDummyApiResponseInMs({...dummyApiResponseInMs, [type]: 0});
    const startTime = new Date().getTime();
    let elapsedTimeWhenSent;
    if (isString(apiUrl) && apiUrl.length > 10) {
      try {
        const fullUrl = urlcat(
          `${selectedSiteEndpoint}/api/debug/ping-db/${type}`,
        );
        console.log(`Sending dummy request to ${fullUrl}...`);

        const response = await fetch(fullUrl);
        const responseJson = await response.json();
        setDummyApiResponse({...dummyApiResponse, [type]: responseJson});
        elapsedTimeWhenSent = new Date().getTime() - startTime;
      } catch (error) {
        setDummyApiResponse({
          ...dummyApiResponse,
          [type]: `Error: ${JSON.stringify(error)}`,
        });
        logger.error(error);
        elapsedTimeWhenSent = new Date().getTime() - startTime;
      }
      setDummyApiResponseInMs({
        ...dummyApiResponseInMs,
        [type]: elapsedTimeWhenSent,
      });
      logger.info(
        `Dummy API (Type: ${type}) request took ${elapsedTimeWhenSent}ms`,
      );
    }
  };

  const handleDirectDummyRequest = async () => {
    setDummyResponse({});
    const startTime = new Date().getTime();
    let elapsedTimeWhenSent;
    setDummyResponseInMs(0);
    try {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/todos/1',
      );
      const responseJson = await response.json();
      // console.log(responseJson);
      setDummyResponse(responseJson);
      elapsedTimeWhenSent = new Date().getTime() - startTime;
    } catch (error) {
      setDummyResponse({});
      logger.error(error);
      elapsedTimeWhenSent = new Date().getTime() - startTime;
    }
    setDummyResponseInMs(elapsedTimeWhenSent);
  };

  const getSiteEndpointsAsync = async () => {
    logger.debug(`Connecting to ${apiUrl} to get server endpoints...`);
    if (isString(apiUrl) && apiUrl.length > 10) {
      logger.debug(`Connecting to ${apiUrl} to get server endpoints 2...`);
      if (1==1) {
        logger.debug(`Connecting to ${apiUrl} to get server endpoints online...`);
        const fullSiteEndpointUrl = urlcat(`${apiUrl}/api/auth/siteEndpoints`);
        logger.debug(fullSiteEndpointUrl);

        try {
          const response = await fetch(fullSiteEndpointUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          });
          logger.debug(`Connecting to ${apiUrl} to get server endpoints response?...`);
          const responseJson = await response.json();
          // dispatch(updateDirectNetworkStatus(JSON.stringify(responseJson)));
          dispatch(updateSiteEndpoints(responseJson));
          logger.info(`Disovered ${JSON.stringify(responseJson)}`);
          displayToast(`Disovered ${JSON.stringify(responseJson)}`);
        } catch (error) {
          // dispatch(updateDirectNetworkStatus(JSON.stringify(error)));
          displayToast(`Unable to get Site endpoints`);
          logger.warn(`Unable to get Site endpoints`);
        }
      } else {
        logger.debug(`Connecting to ${apiUrl} to get server endpoints offline...`);
        displayToast('Unable to detect network connection');
      }
    }
  };

  useEffect(() => {
    handleDirectDummyRequest().catch((error) => console.log(error));
    getSiteEndpointsAsync().catch((error) => console.log(error));
  }, []);

  const onAutoUpdateClicked = async () => {
    logger.info(`Turning auto update ${!isAutoUpdateEnabled ? 'on' : 'off'}`);
    dispatch(toggleAutoUpdate());
  };

  const onBackButtonPressAndroid = () => {
    if (isAuthenticated) {
      navigation.navigate('Home');
    } else {
      navigation.pop();
    }
  };

  const onWebAppInputPressed = async () => {
    // const storedApiUrl = await getEnvStringOrDefault('WEBAPP_URL');
    DialogAndroid.assignDefaults({
      positiveText: 'OK',
      negativeText: null,
    });
    const {action, text} = await DialogAndroid.prompt(
      'WebApp URL',
      'Enter new TS WebApp address below:',
      {
        defaultValue: webAppUrl,
      },
    );
    switch (action) {
      case DialogAndroid.actionPositive:
        dispatch(updateWebAppUrl(text));
        // await saveDataStringAsync('WEBAPP_URL', text);
        break;
      default:
        break;
    }
  };
  const onAPIInputPressed = async () => {
    DialogAndroid.assignDefaults({
      positiveText: 'OK',
      negativeText: null,
    });
    const {action, text} = await DialogAndroid.prompt(
      'Main Server Address',
      'Enter new API endpoint below:',
      {
        defaultValue: apiUrl,
        // defaultValue:
        //   apiUrl.length > 10 && apiUrl === storedApiUrl ? apiUrl : storedApiUrl,
      },
    );
    switch (action) {
      case DialogAndroid.actionPositive:
        dispatch(updateApiUrl(text));
        // await saveDataStringAsync('API_URL', text);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    getSiteEndpointsAsync().catch((err) => logger.error(err));
  }, [apiUrl]);

  const onSeqLoggingEnabledPressed = async () => {
    logger.info(`Turning ${!seqLoggingEnabled ? 'on' : 'off'} remote logging`);
    dispatch(toggleSeqLogging());
    await saveDataStringAsync(
      'SEQ_LOGGING_ENABLED',
      (!seqLoggingEnabled).toString(),
    );
  };

  const onPrioritizeWebAppPressed = async () => {
    dispatch(setWebAppPrioritised(!isWebAppPrioritised));
  };

  const onEnableWebAppPressed = async () => {
    dispatch(setWebAppEnabled(!isWebAppEnabled));
  };

  const onSiteEndpointPressed = async () => {
    const siteEndpointsMapped = Object.keys(siteEndpoints || {}).map((e) => ({
      id: siteEndpoints[e],
      label: e,
    }));

    const {selectedItem} = await DialogAndroid.showPicker('Pick a Site', null, {
      items: siteEndpointsMapped,
    });
    if (selectedItem) {
      dispatch(updateSelectedSiteEndpoint(selectedItem.label, selectedItem.id));
      // await saveDataStringAsync('SITE_URL', selectedItem.id);
    }
  };

  const resetReduxStore = () => {
    dispatch(resetStore());
    dispatch(resetReduxStore());
  };

  const handleEnableBeta = () => {
    logger.info(
      isBetaEnabled
        ? 'Unsubscribe from Beta channel'
        : 'Subscribing to Beta channel',
    );
    dispatch(toggleBetaChannel());
    if (isAutoUpdateEnabled) dispatch(toggleAutoUpdate());
  };

  const saveInternalState = () => {
    const path = `${
      fs.ExternalDirectoryPath
    }/TSGoInternalStoreSnapshot-${format(new Date(), 'yyyyMMdd-HHmm')}.json`;
    fs.writeFile(path, JSON.stringify(store, 'utf8'))
      .then(() => {
        logger.debug(`Saved store snapshot to ${path}`);
      })
      .catch((err) => logger.error(err));
  };

  const renderNetworkTests = () => (
    <>
      <ListItem
        key="DIRECT_DUMMY_REQUEST"
        onPress={() => handleDirectDummyRequest()}>
        <Icon name="wifi" type="font-awesome" />
        <ListItem.Content>
          <ListItem.Title>[NT] - Direct to jsonplaceholder</ListItem.Title>
          <ListItem.Subtitle>
            {dummyResponseInMs}ms - {JSON.stringify(dummyResponse)}
          </ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
      <ListItem key="1_DUMMY_REQUEST" onPress={() => handleDummyAPIRequest(1)}>
        <Icon name="wifi" type="font-awesome" />
        <ListItem.Content>
          <ListItem.Title>[NT] - Small (1) SQL response payload</ListItem.Title>
          <ListItem.Subtitle>
            {dummyApiResponseInMs[1] || 0}ms -{' '}
            {JSON.stringify(
              isArray(dummyApiResponse[1])
                ? dummyApiResponse[1].length + ' records'
                : dummyApiResponse[1],
            )}
          </ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
      <ListItem key="2_DUMMY_REQUEST" onPress={() => handleDummyAPIRequest(2)}>
        <Icon name="wifi" type="font-awesome" />
        <ListItem.Content>
          <ListItem.Title>[NT] - Large (2) SQL response payload</ListItem.Title>
          <ListItem.Subtitle>
            {dummyApiResponseInMs[2] || 0}ms -{' '}
            {JSON.stringify(
              isArray(dummyApiResponse[2])
                ? dummyApiResponse[2].length + ' records'
                : dummyApiResponse[2],
            )}
          </ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
    </>
  );

  const onClearQueuePressed = () => {
    displayDialogWithOptions(
      'Are you sure?',
      'This will clear the offline queue and data will be loss. Reminder: Use Save Internal State before this action.',
      {
        success: () => {
          dispatch({type: RESET_STATE});
        },
        negative: () => {},
        dismiss: () => {},
        buttons: {
          positiveText: 'OK',
          negativeText: 'Cancel',
        },
      },
    );
  };

  const onClearStorePressed = () => {
    displayDialogWithOptions(
      'Are you sure?',
      'This will reset the internal store? Data LOSS is imminent!',
      {
        success: resetReduxStore,
        negative: () => {},
        dismiss: () => {},
        buttons: {
          positiveText: 'OK',
          negativeText: 'Cancel',
        },
      },
    );
  };

  const items = [
    {
      key: 'API_URL',
      title: 'Main Server Address',
      subTitle: apiUrl,
      iconName: 'wifi',
      iconType: 'font-awesome',
      onClick: () => onAPIInputPressed(),
      showRighArrow: true,
      show: true,
    },
    {
      key: 'SITE_URL',
      title: 'Pick a Location',
      subTitle:
        selectedSiteEndpoint && selectedSiteName
          ? `${selectedSiteEndpoint} (${selectedSiteName})`
          : '',
      iconName: 'globe',
      iconType: 'font-awesome',
      showRighArrow: true,
      onClick: () => onSiteEndpointPressed(),
      show: siteEndpoints && !isEmpty(siteEndpoints),
    },
    {
      key: 'ENABLE_WEBAPP',
      title: 'Enable WebApp?',
      subTitle: isWebAppEnabled ? 'Enabled' : 'Disabled',
      iconName: 'internet-explorer',
      iconType: 'font-awesome',
      showRighArrow: false,
      onClick: () => onEnableWebAppPressed(),
      show: true,
    },
    {
      key: 'PRIORITISE_WEBAPP',
      title: 'Prioritise WebApp?',
      subTitle: isWebAppPrioritised ? 'Prioritised' : 'Normal',
      iconName: 'globe',
      iconType: 'font-awesome',
      showRighArrow: false,
      onClick: () => onPrioritizeWebAppPressed(),
      show: isWebAppEnabled,
    },
    {
      key: 'WEBAPP_URL',
      title: 'WebApp Server Address',
      subTitle: webAppUrl,
      iconName: 'globe',
      iconType: 'font-awesome',
      showRighArrow: true,
      onClick: () => onWebAppInputPressed(),
      show: isWebAppEnabled,
    },
    {
      key: 'SAVE_INTERNAL_STATE',
      title: 'Save Internal State',
      subTitle: 'Tap to save internal state to local storage',
      iconName: 'cog',
      iconType: 'font-awesome',
      showRighArrow: false,
      onClick: () => saveInternalState(),
      show: true,
    },
    {
      key: 'FORCE_AUTO_UPDATE',
      title: 'Check For Update',
      subTitle: '',
      iconName: 'paperclip',
      iconType: 'font-awesome',
      showRighArrow: false,
      onClick: () =>
        otaCodePushAutoUpdate(isBetaEnabled ? 'staging' : 'production'),
      show: true,
    },
    {
      key: 'AUTO_UPDATE_ENABLED',
      title: 'Enable OTA App Update?',
      subTitle: isAutoUpdateEnabled ? 'Enabled' : 'Disabled',
      iconName: 'grav',
      iconType: 'font-awesome',
      showRighArrow: false,
      onClick: () => onAutoUpdateClicked(),
      show: true,
    },
    {
      key: 'ENABLE_BETA_CHANNEL',
      title: 'Enable Beta Channel?',
      subTitle: isBetaEnabled ? 'Enabled' : 'Disabled',
      iconName: 'paperclip',
      iconType: 'font-awesome',
      showRighArrow: false,
      onClick: () => handleEnableBeta(),
      show: true,
    },
    {
      key: 'ENABLE_LOGGING',
      title: 'Enable remote logging?',
      subTitle: seqLoggingEnabled ? 'Enabled' : 'Disabled',
      iconName: 'wrench',
      iconType: 'font-awesome',
      showRighArrow: false,
      onClick: () => onSeqLoggingEnabledPressed(),
      show: true,
    },
    {
      key: 'CLEAR_QUEUE',
      title: 'Force reset Queue',
      subTitle: 'Tap to reset offline queue',
      iconName: 'cog',
      iconType: 'font-awesome',
      showRighArrow: false,
      onClick: () => onClearQueuePressed(),
      show: true,
    },
    {
      key: 'CLEAR_STORE',
      title: 'Force reset Redux store',
      subTitle: 'Tap to reset Redux store',
      iconName: 'cog',
      iconType: 'font-awesome',
      showRighArrow: false,
      onClick: () => onClearStorePressed(),

      show: true,
    },
    {
      key: 'NETWORK_TESTS',
      title: `${showNetworkDebugTests ? 'Disable' : 'Enable'} Network Tests`,
      subTitle: `${showNetworkDebugTests ? 'Enabled' : 'Disabled'}`,
      iconName: 'cog',
      iconType: 'font-awesome',
      showRighArrow: false,
      onClick: () => setShowNetworkDebugTests(!showNetworkDebugTests),
      show: true,
    },
  ];

  return (
    <ScrollView>
      {items.map((e) => {
        return (
          <ListItem
            disabledStyle={{
              textColor: 'white',
              color: 'white',
              backgroundColor: 'lightgray',
            }}
            disabled={!e.show}
            key={e.key}
            onPress={e.onClick}>
            <Icon name={e.iconName} type={e.iconType} />
            <ListItem.Content>
              <ListItem.Title>{e.title}</ListItem.Title>
              {isString(e.subTitle) && e.subTitle.length > 0 && (
                <ListItem.Subtitle>{e.subTitle}</ListItem.Subtitle>
              )}
            </ListItem.Content>
            {e.showRighArrow && <ListItem.Chevron size={30} />}
          </ListItem>
        );
      })}
      {showNetworkDebugTests ? renderNetworkTests() : null}
      <Button
        buttonStyle={styles.buttonStyle}
        containerStyle={styles.buttonContainerStyle}
        title="Back"
        onPress={() => {
          onBackButtonPressAndroid();
        }}
      />
    </ScrollView>
  );
};

export default SettingsScreen;
