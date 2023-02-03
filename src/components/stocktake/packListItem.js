import React, {Component, useMemo, useRef} from 'react';
import {View, Text, TouchableHighlight} from 'react-native';
import {ListItem, Icon} from 'react-native-elements';
import Swipeable from 'react-native-swipeable';
import {isArray} from 'lodash';
import {connect, useDispatch} from 'react-redux';
import styles from '../../styles/styles';
import {deletePackFromRow} from '../../reducers/stocktake/stocktakeReducer';
import {displayDialogWithOptions} from '../../helpers/utils';

// const rightButtons = ;

const PackListItem = React.memo((props) => {
  const dispatch = useDispatch();
  const swipeableRef = useRef();
  const {
    item: {type, actualCount, packNo, uuid, match, known, product, tallies},
  } = props;

  return (
    <Swipeable
      ref={swipeableRef}
      rightButtons={[
        <TouchableHighlight
          style={[styles.rightSwipeItem, {backgroundColor: '#FF0000'}]}
          onPress={() => {
            dispatch(deletePackFromRow({uuid}));
            setTimeout(() => {
              if (swipeableRef.current) swipeableRef.current.recenter();
            }, 100);
          }}>
          <Text>Delete</Text>
        </TouchableHighlight>,
      ]}>
      <ListItem
        key={uuid}
        onPress={async () => {
          swipeableRef.current?.recenter();
          displayDialogWithOptions(
            'Confirmation',
            'Do you want to remove this?',
            {
              success: () => {
                dispatch(deletePackFromRow({uuid}));
                // resendItem();
              },
              negative: () => {},
              dismiss: () => {},
              buttons: {
                positiveText: 'Confirm',
                negativeText: 'Cancel',
              },
            },
          );
        }}>
        <Icon name={match ? 'check' : 'times'} type="font-awesome" />
        <ListItem.Content>
          <ListItem.Title>{packNo}</ListItem.Title>
          <ListItem.Subtitle>
            {/* <View style={styles.subtitleView}>
              <Text style={styles.subtitleText}> */}
            {`Product: ${product} Known: ${known} Match: ${match}${
              type === 'bin' ? ' Actual Count: ' + actualCount : ''
            }${
              isArray(tallies)
                ? ' Tally:' + tallies.map((e) => ` ${e.length}/${e.pieces}`)
                : ''
            }`}
            {/* </Text>
            </View> */}
          </ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
    </Swipeable>
  );
});

export default PackListItem;
