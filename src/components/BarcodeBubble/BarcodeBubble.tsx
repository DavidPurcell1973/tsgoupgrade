import {Text, Button, Tooltip, Overlay, Divider} from 'react-native-elements';
import * as React from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {useState} from 'react';
import styles from './BarcodeBubbleStyles';
import TwoColumnsDataGrid from '../twoColumnsDataGrid';

const BarcodeBubble = (props) => {
  const {item, id, overlayHeaders = [], hiddenFields = ['id']} = props;
  const [show, setShow] = useState(false);
  const handlePress = () => {
    setShow(true);
    setTimeout(() => setShow(false), 2000);
  };

  const hideOverlay = () => {
    setShow(false);
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
      <Overlay
        isVisible={show}
        onBackdropPress={() => hideOverlay()}
        overlayStyle={styles.overlayContainer}>
        <ScrollView>
          <TwoColumnsDataGrid
            title=""
            headers={overlayHeaders}
            hidden={hiddenFields}
            data={item}
          />
        </ScrollView>
      </Overlay>
    </View>
  );
};

export default BarcodeBubble;
