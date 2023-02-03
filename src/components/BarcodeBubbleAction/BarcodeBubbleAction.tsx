import {Text, Button, Tooltip, Overlay, Divider} from 'react-native-elements';
import * as React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useState} from 'react';
import styles from './BarcodeBubbleStyles';
import {isFunction} from 'lodash';

const BarcodeBubbleAction = (props) => {
  const {item, id, overlayHeaders = [], action, hiddenFields = ['id']} = props;
  const handlePress = () => {
    if (isFunction(action)) action(item);
  };

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: 'cyan',
        margin: 2,
        borderRadius: 10,
        padding: 2,
        backgroundColor: 'lightcyan',
      }}>
      <TouchableOpacity onPress={handlePress}>
        <Text>{item[id] || 'Empty'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BarcodeBubbleAction;
