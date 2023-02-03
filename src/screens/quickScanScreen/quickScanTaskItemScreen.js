import React, {useEffect, useRef, useState} from 'react';
import {FlatList, View} from 'react-native';
import {
  Button,
  ButtonGroup,
  Icon,
  Input,
  ListItem,
  Text,
} from 'react-native-elements';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import isArray from 'lodash/isArray';
import {v4 as uuid} from 'uuid';
import DialogAndroid from 'react-native-dialogs';
import fecha from 'fecha';
import {Dropdown} from 'react-native-material-dropdown-no-proptypes';
import logger from '../../helpers/logger';
import {
  doAddPack,
  doClearPack,
  doRemovePack,
  setIsSyncing,
  syncTask,
} from '../../reducers/quickScan/quickScanReducer';
import SwipeableContainer from '../../components/swipeableContainer/swipeableContainer';
import Title from '../../components/title/title';
import styles from './quickScanStyles';
import {
  displayDialog,
  displayDialogWithOptions,
  displayToast,
} from '../../helpers/utils';
import {
  apiUrlSelector,
  getUserAppConfigValueSelector,
} from '../../selectors/common/commonSelector';

const QuickScanTaskItemScreen = (props) => {
  const inputRef = useRef(null);
  const inputListRef = useRef(null);
  const dispatch = useDispatch();
  const {
    route: {params: task},
    navigation,
  } = props;
  const {appStore, quickScanStore} = useSelector((state) => state);
  const enableDuplicateInputCheck =
    useSelector((state) =>
      getUserAppConfigValueSelector(
        state,
        'QuickScan',
        'enableQuickScanDuplicateInputCheck',
      ),
    ) || false;
  const {taskGuid, categoryDisplayName, taskDescription} = task;
  const {taskCategories, scannedPacks, isSyncing} = quickScanStore;
  const {username} = appStore;
  const packsForTask = scannedPacks.filter((e) => e.taskGuid === taskGuid);
  const successfulSyncPacks = packsForTask.filter(
    (e) => e.isSent && !e.isError,
  );
  const packsToSync = packsForTask.length - successfulSyncPacks.length;

  const [input, setInput] = useState('');
  const [dropdownInput, setDropdownInput] = useState('');
  const [waitForUserResponse, setWaitForUserResponse] = useState(false);
  const [buttonGroupDisabled, setButtonGroupDisabled] = useState(true);
  const dropdownSelections = taskCategories
    .filter((e) => e.taskType === task.taskType)
    .map((e) => ({
      label: e.categoryDescription,
      value: e.taskCategoryGuid,
    }));

  const displayClearList = () => {
    if (packsForTask.length > 0 && packsToSync === 0 && !waitForUserResponse) {
      setWaitForUserResponse(true);
      const successCallback = () => {
        dispatch(setIsSyncing(false));
        dispatch(doClearPack(task.taskGuid));
        setButtonGroupDisabled(true);
        setWaitForUserResponse(false);
      };
      const cancelledCallback = () => {
        setWaitForUserResponse(false);
      };
      displayDialogWithOptions(
        'Clear',
        'All packs have been synchronised. Clear the list?',
        {
          success: successCallback,
          negative: cancelledCallback,
          dismiss: cancelledCallback,
          buttons: {
            positiveText: 'OK',
            negativeText: 'Cancel',
          },
        },
      ).done();
    }
  };

  const refocusInput = (ms) => {
    setTimeout(() => {
      if (inputListRef.current) {
        inputListRef.current?.scrollToEnd();
      }

      if (inputRef.current) {
        inputRef.current?.focus();
      }
    }, ms || 100);
  };

  useEffect(() => {
    setTimeout(() => {
      if (packsForTask.length > 0) {
        setButtonGroupDisabled(false);
      }
    }, 100);
    displayClearList();
    refocusInput();
  }, []);

  const submitInput = () => {
    displayClearList();
    if (dropdownSelections.length > 0 && dropdownInput.length === 0) {
      displayDialog(
        'Error',
        `Invalid dropdown ${task.categoryDisplayName} selection`,
      ).done();
    } else {
      const foundDuplicate =
        packsForTask.filter(
          (pack) =>
            pack.packNo.toLowerCase() === input.toLowerCase() &&
            pack.taskCategoryGuid === dropdownInput,
        ).length > 0;
      if (enableDuplicateInputCheck && foundDuplicate) {
        displayToast('Duplicate input');
      } else {
        const newItem = {
          taskGuid,
          uuid: uuid().toUpperCase(),
          packNo: input,
          taskCategoryGuid: dropdownInput,
          scannedOn: fecha.format(new Date(), 'YYYY-MM-DD hh:mm:ss'),
          scannedBy: username,
        };
        dispatch(doAddPack(newItem));
      }
    }
    setInput('');
    setButtonGroupDisabled(false);
    refocusInput();
  };

  const renderItem = ({item}) => {
    const removePack = () => {
      dispatch(doRemovePack(item.taskGuid, item.uuid, item.packNo));
      if (packsForTask.length === 1) {
        setButtonGroupDisabled(true);
      }
    };
    const rightButtons = [{name: 'Delete', action: removePack, color: 'red'}];

    const taskCategoryName =
      taskCategories.filter((e) => e.taskCategoryGuid === item.taskCategoryGuid)
        .length > 0
        ? taskCategories.filter(
            (e) => e.taskCategoryGuid === item.taskCategoryGuid,
          )[0].categoryDescription
        : null;

    return (
      <SwipeableContainer rightButtons={rightButtons}>
        <ListItem key={item.uuid} onPress={() => {}}>
          <Icon name="barcode" type="font-awesome" />
          <ListItem.Content>
            <ListItem.Title>{item.packNo}</ListItem.Title>
            <ListItem.Subtitle>
              <View style={styles.subtitleView}>
                <Text style={styles.subtitleText}>
                  {`${taskCategoryName ? `${taskCategoryName} -` : ''} ${
                    item.status && item.status.length > 0 ? item.status : 'New'
                  }`}
                </Text>
              </View>
            </ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
      </SwipeableContainer>
    );
  };

  const onSyncButtonPressed = async () => {
    const debug = quickScanStore.scannedPacks.filter(
      (e) => e.taskGuid === task.taskGuid && (!e.isSent || e.isError),
    );

    if (!isSyncing) {
      if (packsToSync > 0) {
        const message = `Syncing ${packsToSync} packs with server...`;
        logger.debug(JSON.stringify(debug));
        logger.debug(`${message} Total ${packsForTask.length || 0}`);
        displayToast(message);
        syncTask(task);
      }
    } else {
      displayToast('Unable to sync - another sync is in progress...');
    }
    setTimeout(() => displayClearList(), 5000);
    refocusInput();
  };

  const onClearButtonPressed = async () => {
    DialogAndroid.assignDefaults({
      positiveText: 'Confirm',
      negativeText: 'Cancel',
    });

    const {action, text} = await DialogAndroid.alert(
      'Clear',
      'Are you sure you want to clear this batch?',
    );

    switch (action) {
      case DialogAndroid.actionPositive:
        dispatch(setIsSyncing(false));
        dispatch(doClearPack(task.taskGuid));
        setButtonGroupDisabled(true);
        break;
      default:
        break;
    }
    refocusInput();
  };

  const onDropdownSelectionChange = (value) => {
    setDropdownInput(value);
    refocusInput();
  };

  const onButtonGroupPress = (index) => {
    switch (index) {
      case 0:
        onClearButtonPressed().done();
        break;
      case 1:
        onSyncButtonPressed().done();
        break;
      default:
    }
  };

  const buttons = [
    'Clear',
    `Sync ${
      packsForTask.length > 0
        ? `${successfulSyncPacks.length}/${packsForTask.length}`
        : ''
    }`,
  ];

  return (
    <View style={styles.container}>
      <Title text={`${taskDescription}`} />
      <ButtonGroup
        disabled={buttonGroupDisabled}
        onPress={onButtonGroupPress}
        buttons={buttons}
        containerStyle={styles.groupButtonContainer}
      />
      <View style={styles.inputContainer}>
        {dropdownSelections.length > 0 ? (
          <Dropdown
            label={
              task.categoryDisplayName && task.categoryDisplayName.length > 0
                ? task.categoryDisplayName.trim()
                : 'Select Type'
            }
            containerStyle={styles.runDropdownStyle}
            data={dropdownSelections}
            onChangeText={onDropdownSelectionChange}
            animationDuration={50}
            itemCount={8}
            itemPadding={10}
          />
        ) : null}
        <Input
          containerStyle={styles.inputStyle}
          // style={styles.input}
          ref={inputRef}
          blurOnSubmit={false}
          onChangeText={(text) => {
            setInput(text);
          }}
          value={input}
          placeholder="Scan barcode here"
          placeholderTextColor="gray"
          onSubmitEditing={() => {
            submitInput();
          }}
        />
      </View>
      {isArray(packsForTask) && packsForTask.length > 0 ? (
        <FlatList
          ref={inputListRef}
          data={packsForTask}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.uuid}`}
        />
      ) : null}
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

export default QuickScanTaskItemScreen;
