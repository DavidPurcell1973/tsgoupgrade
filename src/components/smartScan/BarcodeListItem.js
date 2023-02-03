import React, {useMemo, useRef, useState} from 'react';
import Swipeable from 'react-native-swipeable';
import {v4 as uuidV4} from 'uuid';
import {useDispatch, shallowEqual, useSelector} from 'react-redux';
import {View, FlatList, TouchableHighlight} from 'react-native';
import {displayDialogWithOptions} from '../../helpers/utils';
import {
  addPackToTask,
  sendItem,
  updateUserInput,
  updateDropdownInput,
  deleteItem,
  clearItems,
  loadTaskCategories,
} from '../../reducers/smartScan/smartScanReducer';
import {
  Icon,
  Text,
  Button,
  Input,
  ListItem,
  Tooltip,
} from 'react-native-elements';
import styles from '../../styles/styles';

const BarcodeListItem = (props) => {
  const swipeableRef = useRef();
  const [currentlyOpenSwipeable, setCurrentlyOpenSwipeable] = useState(null);
  const dispatch = useDispatch();

  const memoizedItem = useMemo(() => {
    return props?.item;
  }, [props]);

  const {refocusInput, memoizedTask, apiUrl, apiToken} = props;

  const {uuid, status, input} = memoizedItem || {
    uuid: uuid(),
    status: 'Error',
    input: 'Unknown',
    // apiUrl: '',
    // apiToken: '',
    // memoizedTask: null,
  };

  const resendItem = () => {
    if (apiUrl && apiToken && memoizedTask) {
      const newItem = {...memoizedItem, uuid: uuidV4()};
      dispatch(addPackToTask(newItem));
      dispatch(sendItem(memoizedTask, null, newItem, apiUrl, apiToken));
    } else logger.warn('API URL and token cannot be empty.');
    swipeableRef.current?.recenter();
    refocusInput();
  };

  return (
    <Swipeable
      ref={swipeableRef}
      onRightButtonsOpenRelease={(event, gestureState, swipeable) => {
        setCurrentlyOpenSwipeable(swipeable);
      }}
      onRightButtonsCloseRelease={() => {
        setCurrentlyOpenSwipeable(null);
      }}
      rightButtons={[
        <TouchableHighlight
          style={[styles.rightSwipeItem, {backgroundColor: 'turquoise'}]}
          onPress={() => {
            resendItem();
          }}>
          <Text>Retry</Text>
        </TouchableHighlight>,
        <TouchableHighlight
          style={[styles.rightSwipeItem, {backgroundColor: 'red'}]}
          onPress={() => {
            dispatch(deleteItem(memoizedItem));
            refocusInput();
          }}>
          <Text>Delete</Text>
        </TouchableHighlight>,
      ]}>
      <ListItem
        key={uuid}
        onPress={async () => {
          swipeableRef.current?.recenter();
          if (
            !(
              memoizedItem.status.includes('PENDING') ||
              memoizedItem.status.includes('COMPLETE')
            )
          ) {
            displayDialogWithOptions(
              'Confirmation',
              'Do you want to resend this?',
              {
                success: () => {
                  resendItem();
                },
                negative: () => {},
                dismiss: () => {},
                buttons: {
                  positiveText: 'Confirm',
                  negativeText: 'Cancel',
                },
              },
            );
          }
          // refocusInput();
        }}>
        <Icon name="barcode" type="font-awesome" />
        <ListItem.Content>
          <ListItem.Title>{input}</ListItem.Title>
          <ListItem.Subtitle>
            {/* <View style={styles.subtitleView}>
                <Text style={styles.subtitleText}> */}
            {status}
            {/* </Text>
              </View> */}
          </ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
    </Swipeable>
  );
};

export default BarcodeListItem;
