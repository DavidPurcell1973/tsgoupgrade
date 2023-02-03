import React, {useRef} from 'react';
import {Text, TouchableHighlight} from 'react-native';
import {ListItem, Icon} from 'react-native-elements';
import Swipeable from 'react-native-swipeable';
import {isArray} from 'lodash';
import {useDispatch} from 'react-redux';
import styles from '../../styles/styles';
import {displayDialogWithOptions, displayToast} from '../../helpers/utils';
import {deleteScannedPack} from '../../reducers/itiConsignmentStocktake/itiConsignmentStocktakeReducer';

const PackListItem = React.memo((props) => {
  const dispatch = useDispatch();
  const swipeableRef = useRef();
  const {
    item: {packetNo, bin, productCode, pieceCount, pieces, scanned},
  } = props;

  return (
    <Swipeable
      ref={swipeableRef}
      rightButtons={[
        <TouchableHighlight
          style={[styles.rightSwipeItem, {backgroundColor: '#FF0000'}]}
          onPress={() => {
            dispatch(deleteScannedPack(packetNo));
            setTimeout(() => {
              if (swipeableRef.current) swipeableRef.current.recenter();
            }, 100);
          }}>
          <Text>Delete</Text>
        </TouchableHighlight>,
      ]}>
      <ListItem
        key={packetNo}
        onPress={async () => {
          swipeableRef.current?.recenter();
          if (scanned === '1') {
            displayDialogWithOptions(
              'Confirmation',
              'Do you want to remove this?',
              {
                success: () => {
                  dispatch(deleteScannedPack(packetNo));
                },
                negative: () => {},
                dismiss: () => {},
                buttons: {
                  positiveText: 'Confirm',
                  negativeText: 'Cancel',
                },
              },
            );
          } else {
            displayToast(`Packet ${packetNo} has not been scanned`);
          }
        }}>
        {scanned === '1' ? (
          <Icon name={'check'} type="font-awesome" />
        ) : (
          <Icon name={'close'} type="font-awesome" />
        )}
        <ListItem.Content>
          <ListItem.Title>{packetNo}</ListItem.Title>
          <ListItem.Subtitle>
            {/* <View style={styles.subtitleView}>
              <Text style={styles.subtitleText}> */}
            {`Product: ${productCode} ${
              bin === '1' ? ' Actual Count: ' + pieceCount : ''
            }`}
            {/* </Text> */}
            {/* </View> */}
          </ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
    </Swipeable>
  );
});

export default PackListItem;
