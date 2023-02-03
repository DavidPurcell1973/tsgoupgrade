import React from 'react';
import PropTypes from 'prop-types';
import {Text, View} from 'react-native';
import styles from '../../styles/styles';

const SettingsList = ({app}) => (
  <View style={styles.container}>
    <Text>Settings</Text>
    <Text>{JSON.stringify(app)}</Text>
  </View>
);

SettingsList.propTypes = {
  app: PropTypes.object.isRequired,
};

export default SettingsList;
