import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import styles from './webAppStyles';
import WebApp from '../../components/WebApp';
import logger from '../../helpers/logger';

const WebAppWebView = () => {
  const {appStore} = useSelector((state) => state);
  const {
    username,
    deviceInfo: {androidId, deviceName},
  } = appStore;

  useEffect(() => {
    logger.debug(`${username} (${deviceName} or ${androidId}) using WebApp...`);
  }, []);

  return (
    <View style={styles.container}>
      <WebApp />
    </View>
  );
};

export default WebAppWebView;
