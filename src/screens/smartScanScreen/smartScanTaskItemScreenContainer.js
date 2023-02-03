import React, {useRef, useState, useMemo, useCallback, useEffect} from 'react';
import {displayDialogWithOptions} from '../../helpers/utils';
import Config from 'react-native-config';
import {playGoodSound, playBadSound} from '../../components/common/playSound';
import 'react-native-get-random-values'; // Added because uuid 7.0.x is broken without it
import {View, FlatList} from 'react-native';
import {v4 as uuid} from 'uuid';
import {useDispatch, shallowEqual, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {
  Icon,
  Text,
  Button,
  Input,
  ListItem,
  Tooltip,
} from 'react-native-elements';
// import slowlog from 'react-native-slowlog';
import fecha from 'fecha';
import {Dropdown} from 'react-native-material-dropdown-no-proptypes';
import DialogAndroid from 'react-native-dialogs';
import styles from './smartScanStyles';
import logger from '../../helpers/logger';
import Title from '../../components/title/title';
import {
  addPackToTask,
  sendItem,
  clearItems,
  loadTaskCategories,
  updateDropdownInput,
} from '../../reducers/smartScan/smartScanReducer';
import {apiUrlSelector} from '../../selectors/common/commonSelector';
import {displayDialog} from '../../helpers/utils';
import useHoneywellScanner from '../../hooks/useHoneywellScanner';

// require('react-native-highlight-updates');
import {isArray} from 'lodash';
import {useFocusEffect} from '@react-navigation/native';
import BarcodeListItem from '../../components/smartScan/BarcodeListItem';

const SmartScanTaskItemScreenContainer = (props) => {
  let honeywellScanner = null;

  const {taskGuid, taskType} = props;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  // slowlog(this, /.*/, { verbose: true, threshold: 16, log: console });
  const barcodeInputRef = useRef();
  const dropdownInputRef = useRef();
  const centerRef = useRef();
  const {appStore, smartScanStore} = useSelector((state) => state);
  const {
    input,
    taskCategories,
    tasks,
    dropdownInput: dropdown,
  } = smartScanStore;
  const {username, token: apiToken} = appStore;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [dropdownInput, setDropdownInput] = useState('');
  const memoizedTaskItems = useMemo(() => {
    return isArray(input[taskGuid]) ? input[taskGuid] : 0;
  }, [input]);
  const memoizedTotalInputCount = useMemo(() => {
    return memoizedTaskItems.length || 0;
  }, [memoizedTaskItems]);
  const memoizedSuccessfulInputCount = useMemo(() => {
    return isArray(memoizedTaskItems)
      ? memoizedTaskItems.filter((e) => e.status.includes('COMPLETE')).length
      : 0;
  }, [memoizedTaskItems]);
  const memoizedTaskCategories = useMemo(() => {
    let categories = [];
    if (isArray(taskCategories) && taskCategories.length > 0) {
      categories = taskCategories.filter(
        (item) => item.taskType === props.taskType,
      );
    } else return [];
    return categories.map((e) => ({
      label: e.categoryDescription,
      value: e.taskCategoryGuid,
    }));
  }, [taskCategories]);
  const memoizedTask = useMemo(() => {
    if (isArray(tasks) && tasks.length > 0) {
      return tasks.filter((e) => e.taskGuid === taskGuid)[0];
    } else return {};
  }, [tasks]);

  const {
    categoryDescription = 'categoryDescription',
    taskDescription = 'No Task selected',
    categoryDisplayName = 'Select',
  } = memoizedTask;

  const refocusInput = () => {
    // setTimeout(() => {
    barcodeInputRef.current?.focus();
    // }, 100);
  };

  useFocusEffect(
    useCallback(() => {
      refocusInput();
    }, []),
  );

  const onTaskSubmit = (text, data) => {
    const barcodeInputTemp = text || barcodeInput;

    logger.debug(dropdownInput);
    logger.debug(data?.dropdownInput);
    // data.dropdownInput is not used... If it's not here, dropdownInput will not work when Honeywell scanner is used... Bug!

    if (
      isArray(memoizedTaskCategories) &&
      memoizedTaskCategories.length > 0 &&
      dropdownInput.length === 0
    ) {
      displayDialog(
        'Error',
        'Invalid ' + categoryDisplayName + ' selection',
      ).catch();
    } else if (barcodeInputTemp.length !== 0) {
      const item = {
        sourceUuid: `${taskGuid}`,
        uuid: uuid().toUpperCase(),
        input: barcodeInputTemp,
        dropdownInput,
        status: 'PENDING',
        scannedOn: fecha.format(new Date(), 'YYYY-MM-DD hh:mm:ss'),
        scannedBy: username,
      };
      dispatch(addPackToTask(item));
      dispatch(sendItem(memoizedTask, null, item, apiUrl, apiToken));
      logger.info(`Sending input ${barcodeInputTemp} to ${apiUrl}`);
      if (barcodeInputRef.current) barcodeInputRef.current.clear();
    } else {
      displayDialog('Error', 'Invalid barcode').done();
    }
    refocusInput();
  };

  honeywellScanner = useHoneywellScanner({
    onBarcodeReadSuccess: onTaskSubmit,
    // enabled: !(
    //   isArray(memoizedTaskCategories) && memoizedTaskCategories.length > 0
    // ),
    data: {dropdownInput},
    screen: 'SmartScanScanPack',
  });

  useEffect(() => {
    if (memoizedTotalInputCount > 50) {
      displayDialogWithOptions('Queue Too Long!', 'Can I clear the Queue?', {
        success: () => {
          dispatch(clearItems(memoizedTask));
        },

        negative: () => {},
        dismiss: () => {},
        buttons: {
          positiveText: 'Yes',
          negativeText: 'No',
        },
      });
    }
    if (apiUrl && apiToken) dispatch(loadTaskCategories(apiUrl, apiToken));
  }, [apiUrl, apiToken]);

  // useFocusEffect(() => {
  //   if (inputListRef.current) {
  //     inputRef.current.focus();
  //   }
  // });

  // shouldComponentUpdate(nextProps) {
  //   const {taskItems} = this.props;
  //   return taskItems !== nextProps.taskItems;
  // }

  const refreshTaskCategories = () => {
    if (apiUrl && apiToken) {
      dispatch(loadTaskCategories(apiUrl, apiToken));
    } else logger.warn('API URL and token cannot be empty.');
  };

  const onBarcodeTextChange = (text) => {
    setBarcodeInput(text);
  };

  const onDropdownInputTextChange = (value) => {
    logger.info(`Dropdown value changed to ${value}`);
    setDropdownInput(value);
    // dispatch(updateDropdownInput(value));
    refocusInput();
  };

  const recenterList = () => {
    if (currentlyOpenSwipeable) {
      currentlyOpenSwipeable.recenter();
    }
  };

  const onClearItemsPressed = async () => {
    displayDialogWithOptions(
      'Clear',
      'Are you sure you want to clear the list?',
      {
        success: () => {
          dispatch(clearItems(memoizedTask));
        },
        negative: () => {},
        dismiss: () => {},
        buttons: {
          positiveText: 'Confirm',
          negativeText: 'Cancel',
        },
      },
    );

    refocusInput();
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Title text={`${taskDescription || 'Loading...'}`} />
        <Tooltip
          overlayColor={'gray'}
          backgroundColor={'white'}
          height={70}
          // ref={counterRef}
          popover={<Text>Successful/total counts - click to reset</Text>}>
          <Button
            // containerStyle={styles.buttonContainerStyle}
            style={styles.buttonStyle}
            type="clear"
            // raised
            title={
              (memoizedSuccessfulInputCount !== undefined
                ? `${memoizedSuccessfulInputCount.toString()}/`
                : '') + memoizedTotalInputCount.toString()
            }
            onPress={onClearItemsPressed}
          />
        </Tooltip>
      </View>
      <View style={styles.smartScanInputContainer}>
        {memoizedTaskCategories.length > 0 && (
          <Dropdown
            label={
              categoryDisplayName && categoryDisplayName.length > 0
                ? categoryDisplayName.trim()
                : 'Select'
            }
            containerStyle={styles.runDropdownStyle}
            data={memoizedTaskCategories}
            onChangeText={onDropdownInputTextChange}
            animationDuration={0}
            onFocus={refreshTaskCategories}
            itemCount={8}
            itemPadding={10}
          />
        )}
        <Input
          containerStyle={{
            paddingLeft: 5,
            paddingRight: 5,
          }}
          ref={barcodeInputRef}
          blurOnSubmit={false}
          onChangeText={(text) => {
            onBarcodeTextChange(text);
          }}
          placeholder="Scan barcode here"
          placeholderTextColor="gray"
          onSubmitEditing={() => {
            onTaskSubmit();
          }}
        />
      </View>
      {isArray(memoizedTaskItems) && memoizedTaskItems.length > 0 ? (
        <FlatList
          data={memoizedTaskItems}
          renderItem={(props) => {
            const itemProps = {
              refocusInput,
              memoizedTask,
              apiUrl,
              apiToken,
              ...props,
            };
            return <BarcodeListItem {...itemProps} />;
          }}
          keyExtractor={(item) => item.uuid}
        />
      ) : (
        <View
          style={{
            flexGrow: 1,
            // justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          <Text style={{fontWeight: 'bold'}}>Start scanning...</Text>
          <Text></Text>
          <Text style={{fontStyle: 'italic'}}>
            Tap on the counters to clear this list...
          </Text>
        </View>
      )}
      <Button
        style={styles.shortButton}
        title="Back"
        onPress={() => {
          navigation.pop();
        }}
      />
    </View>
  );
};

export default SmartScanTaskItemScreenContainer;
