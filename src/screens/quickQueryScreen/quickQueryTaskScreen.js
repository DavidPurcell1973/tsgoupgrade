import React, {useCallback, useEffect, useState, useRef, useMemo} from 'react';
import {v4 as uuid} from 'uuid';
import {TextInput, FlatList, View} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import fecha from 'fecha';
import {Button, Icon, ListItem} from 'react-native-elements';
import {
  has,
  isString,
  isArray,
  isEmpty,
  isNil,
  uniqBy,
  intersectionBy,
  camelCase,
  isUndefined,
} from 'lodash';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import styles from './quickQueryStyles';
import Title from '../../components/title/title';
import {apiUrlSelector} from '../../selectors/common/commonSelector';
import logger from '../../helpers/logger';
import {Input} from 'react-native-elements';
import {
  apiSendRequest,
  apiSendActionRequest,
  clearContext,
  clearResult,
  clearResultAction,
} from '../../reducers/quickQuery/quickQueryReducer';
import camelcaseKeys from 'camelcase-keys';
import {isObject} from 'lodash';
import {displayToast} from '../../helpers/utils';
import QuickQueryResultPanel from '../../components/quickQuery/QuickQueryResultPanel';

const QuickQueryTaskScreen = (props) => {
  const dispatch = useDispatch();
  const {appStore, quickQueryStore} = useSelector((state) => state);
  const {username, token, alternativeAppNames} = appStore;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const navigation = useNavigation();
  const barcodeInputRef = useRef();
  const hiddenBarcodeInputRef = useRef();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [hiddenLinkedBarcodeInput, setHiddenLinkedBarcodeInput] = useState('');
  const [hiddenBarcodeInput, setHiddenBarcodeInput] = useState('');
  const [availableActions, setAvailableActions] = useState([]);
  const [isUserInputFocus, setIsUserInputFocus] = useState(false);
  const {tasks, taskActions, resultAction, resultSet, resultContext} =
    quickQueryStore;
  // const memoizedTasks = useMemo(() => uniqBy(tasks, 'quickQueryId'), [tasks]);

  useEffect(() => {
    dispatch(clearContext());
    dispatch(clearResult());
    dispatch(clearResultAction());
  }, []);

  // Handle QueryAction Request
  // const memoizedQueryActionResult = useMemo(() => {
  //   if (has(resultAction, 'complete') && resultAction.complete) {
  //     if (has(resultAction, 'hasError') && !resultAction.hasError) {
  //       return {
  //         headers: resultAction.headers,
  //         data: resultAction.data,
  //         dataType: resultAction.dataType,
  //         actions: resultAction.actions,
  //       };
  //     } else {
  //       return {
  //         headers: [],
  //         data: `No data available for "${resultContext.barcode}"...`,
  //         dataType: 'string',
  //         actions: [],
  //       };
  //     }
  //   }
  //   return resultAction;
  // }, [resultAction]);

  // console.log(resultSet);
  const memoizedResultSet = useMemo(() => {
    if (has(resultSet, 'complete') && resultSet.complete) {
      if (has(resultSet, 'hasError') && !resultSet.hasError) {
        setAvailableActions(resultSet.actions);
        return {
          headers: resultSet.headers,
          data: resultSet.data,
          dataType: resultSet.dataType,
          actions: resultSet.actions,
          toastMessage: resultSet.toastMessage,
          toastMessageDelay: resultSet.toastMessageDelay,
        };
      }
    }
    setAvailableActions([]);
    return {
      headers: [],
      data: isNil(resultContext.barcode)
        ? 'Scan a barcode...'
        : `No data available for "${resultContext.barcode}"...`,
      dataType: 'string',
      actions: [],
      toastMessage: '',
      toastMessageDelay: 1000,
    };
  }, [resultSet]);

  useEffect(() => {
    // Mechanism to deal with resultSet and resultAction changes
    // TODO: Enhance to do chaining result and actions
    if (
      has(memoizedResultSet, 'toastMessage') &&
      memoizedResultSet.toastMessage.length > 0
    ) {
      console.log(memoizedResultSet.toastMessage);
      displayToast(
        memoizedResultSet.toastMessage,
        memoizedResultSet.toastMessageDelay || 1000,
      );
    }
  }, [memoizedResultSet]);

  const memoizedActions = useMemo(() => {
    const parsedActions = camelcaseKeys(
      isString(availableActions) && availableActions.length > 0
        ? JSON.parse(availableActions)
        : availableActions,
    );

    try {
      if (isArray(parsedActions) && parsedActions.length > 0) {
        const validActions = intersectionBy(
          taskActions,
          parsedActions,
          'actionId',
        );
        return validActions;
      }
      return [];
    } catch (err) {
      logger.error(err);
    }
    return [];
  }, [availableActions]);

  const memoizedTask = useMemo(() => {
    if (has(props, 'route.params') && isObject(props.route.params)) {
      return props.route.params;
    } else {
      return {};
    }
  }, [props]);

  const {queryName, queryDescription} = memoizedTask;

  useEffect(() => {
    if (isEmpty(memoizedTask)) {
      navigation.pop();
      displayToast(`Task is not defined correctly!`);
    }
  }, [memoizedTask]);

  const refocusHiddenBarcodeInput = () => {
    if (barcodeInputRef.current) barcodeInputRef.current.focus();
  };

  useFocusEffect(
    useCallback(() => {
      if (!isUserInputFocus && hiddenBarcodeInputRef.current)
        refocusHiddenBarcodeInput;
    }, [resultSet]),
  );

  const handleBarcodeReadSuccess = async (barcode) => {
    dispatch(clearContext());
    dispatch(clearResultAction());
    dispatch(clearResult());
    const randomBarcodes = ['001804', '001805'];
    barcode = randomBarcodes[Math.floor(Math.random() * randomBarcodes.length)];
    console.log(barcode);
    const payload = {
      barcode,
      quickQueryId: memoizedTask.quickQueryId,
      queryProcedure: memoizedTask.queryProcedure,
      scannedOn: fecha.format(new Date(), 'YYYY-MM-DD hh:mm:ss'),
      scannedBy: username,
      uuid: uuid().toUpperCase(),
    };
    dispatch(apiSendRequest(apiUrl, token, payload));
  };

  const handleQueryActionRequest = async (action) => {
    const payload = {
      context: resultContext,
      result: resultSet,
      action,
      quickQueryId: memoizedTask.quickQueryId,
      actionId: action.actionId,
      actionProcedure: action.actionProcedure,
      scannedOn: fecha.format(new Date(), 'YYYY-MM-DD hh:mm:ss'),
      scannedBy: username,
      uuid: uuid().toUpperCase(),
    };
    dispatch(apiSendActionRequest(apiUrl, token, payload));
  };

  const renderRow = ({item}) => (
    <ListItem
      key={item.dynaFormName}
      onPress={() => {
        navigation.navigate('QuickQueryTaskItemScreen', item);
      }}>
      <Icon name="tasks" type="font-awesome" />
      <ListItem.Content>
        <ListItem.Title>{item.queryName}</ListItem.Title>
        <ListItem.Subtitle>{item.queryDescription}</ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );

  return (
    <View style={styles.container}>
      <Title text={queryName} description={queryDescription} />
      <TextInput
        ref={hiddenBarcodeInputRef}
        value={hiddenLinkedBarcodeInput}
        blurOnSubmit={false}
        style={{height: 0, width: 0, marginTop: -30}}
        onChangeText={(text) => {
          setHiddenLinkedBarcodeInput(text);
        }}
        autoCapitalize="none"
        onTextInput={(e) => {
          // console.log(e.nativeEvent.text);
          setHiddenBarcodeInput(hiddenBarcodeInput + e.nativeEvent.text);
        }}
        onSubmitEditing={() => {
          handleBarcodeReadSuccess(hiddenBarcodeInput);
          setHiddenBarcodeInput('');
          setHiddenLinkedBarcodeInput('');
        }}
      />
      <TextInput
        ref={barcodeInputRef}
        blurOnSubmit={true}
        style={{fontSize: 20, borderBottomWidth: 1}}
        value={barcodeInput}
        onChangeText={(text) => {
          setBarcodeInput(text);
        }}
        onBlur={() => {
          setIsUserInputFocus(false);
          if (hiddenBarcodeInputRef.current)
            hiddenBarcodeInputRef.current.focus();
        }}
        onFocus={() => {
          setIsUserInputFocus(true);
          setBarcodeInput('');
        }}
        autoCapitalize="none"
        placeholder="Enter barcode here"
        placeholderTextColor="gray"
        onSubmitEditing={() => {
          handleBarcodeReadSuccess(barcodeInput);
          setBarcodeInput('');
        }}
      />
      <View style={{flex: 1}}>
        <QuickQueryResultPanel
          context={resultContext}
          data={memoizedResultSet}
        />
      </View>
      {isArray(memoizedActions) && memoizedActions.length > 0 && (
        <View
          style={{
            marginTop: 10,
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}>
          {memoizedActions.map((e) => (
            <Button
              containerStyle={styles.buttonContainerStyle}
              buttonStyle={styles.shortButtonStyle}
              key={e.actionId}
              title={e.actionName}
              onPress={() => {
                handleQueryActionRequest(e);
                // navigation.pop();
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default QuickQueryTaskScreen;
