import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import styles from './playgroundStyles';

const PlaygroundLandingScreen = () => {
  const {appStore} = useSelector((state) => state);

  const {
    username,
    deviceInfo: {androidId, deviceName},
  } = appStore;

  return <View style={styles.container}></View>;
};

export default PlaygroundLandingScreen;
