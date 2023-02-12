import React, {useCallback, useEffect, useMemo, useRef, useState, useAppState} from 'react';
import {View} from 'react-native';
import {Input} from 'react-native-elements';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {orderBy, isString} from 'lodash';
import {parse} from 'date-fns';
import styles from './loadPlanningStyles';
import Title from '../../components/title/title';
import {
  clearLoadItems,
  loadLoads,
} from '../../reducers/loadPlanning/loadPlanningReducer';
import ScrollableCard from '../../components/scrollableCard/scrollableCardWithCompactView';
import {apiUrlSelector} from '../../selectors/common/commonSelector';
import logger from '../../helpers/logger';
import {displayToast} from '../../helpers/utils';
import useHoneywellScanner from '../../hooks/useHoneywellScanner';
import HoneywellScanner from 'react-native-honeywell-scanner-v2';
import {consignmentCustomerSelector} from '../../selectors/loadPlanning/loadPlanningSelector';

const LoadPlanningLoadScreen = (props) => {
  const loadInputRef = useRef();
  const loadListRef = useRef();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const {appStore, loadPlanningStore} = useSelector((state) => state);
  const {
    token: apiToken,
    username,
    deviceInfo: {androidId, deviceName},
  } = appStore;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const navigation = useNavigation();
  const [loadInput, setLoadInput] = useState('');

  const {authorizedApps: apps} = appStore;
  const {loads, refreshing} = loadPlanningStore;
  const isFocus = useIsFocused();

  const memoizedLoads = useMemo(() => {
    const newLoads = loads.map((e) => ({
      ...e,
      parsedDate: parse(e.date, 'yyyy-MM-dd', new Date()),
    }));
    // if (newLoads.length > 0) {
    //   logger.debug(`Converted ${loads[0].date} to ${newLoads[0].parsedDate}`);
    // }
    return orderBy(newLoads, 'parsedDate');
  }, [loads]);

  const refocusLoadInput = () => {
    setTimeout(() => {
      if (loadInputRef.current !== null) {
        loadInputRef.current.focus();
      }
    }, 100);
  };

  const loadLoadsAsync = async () => {
    const message = 'Refreshing Load list';
    displayToast(message);
    logger.info(message);
    dispatch(loadLoads(apiUrl, apiToken));
    dispatch(clearLoadItems());
  };

  useEffect(() => {
    logger.debug(`${username} (${deviceName} or ${androidId}) on Load screen`);
    refocusLoadInput();
    loadLoadsAsync().catch();
  }, [isFocused]);

  useFocusEffect(() => {
    // useCallback(() => {
    refocusLoadInput();
    // }, [loads]),
  });

  const onChangeText = (text) => {
    setLoadInput(text);
  };

  const onSubmit = (input) => {
    dispatch(clearLoadItems());
    const items = memoizedLoads.filter(
      (e) => parseInt(e.loadNo, 10) === parseInt(input || loadInput, 10),
    );

    if (items.length > 0) {
      const item = [items[0]].map((e) => ({
        id: e.loadNo,
        'Load#': e.loadNo,
        Load: e.loadName,
        Customers: e.customers,
        Picked: e.pksPicked,
        'To pick': e.pksToLoad,
        Notes: e.loadNotes,
        Date: e.date,
        Carrier: e.carrier,
        Truck: e.truckTypeName,
        'Weight Picked': e.weightPicked,
        Weight: e.weight,
        PickUp: e.pickup ? 'Yes' : 'No',
        // Completed: e.completed ? 'Yes' : 'No',
        // 'Notes?': isString(e.loadNotes) ? 'Yes' : 'No',
        // 'All picked?': e.pksPicked >= e.pksToLoad ? 'Yes' : 'No',
      }))[0];
      if (item) 
      {
        navigation.navigate('LoadPlanningLoadItem', item); 
      }
      else logger.warn('Load must be an integer!');
    } else {
      displayToast('Unable to find Load - please retry');
      loadLoadsAsync().catch();
      logger.warn('Unable to find Load');
    }
    setLoadInput('');
  };

  if (!apps.includes('LoadPicking')) {
    return (
      <View style={[styles.container, {marginTop: 10}]}>
        <Title>
          Load Picking app is not enabled - please contact TimberSmart.
        </Title>
      </View>
    );
  }

  const handleBarcodeReadSuccess = (text) => {
    onSubmit(text);
  };

  // useEffect(() => {
  //   // console.log('isCompatible?');
  //   if (isFocused) {
  //     if (HoneywellScanner.isCompatible) {
  //       // console.log('isCOmpatible');
  //       HoneywellScanner.startReader().then((isClaimed) => {
  //         logger.debug('Claiming Honeywell scanner is ' + isClaimed + '!');
  //         HoneywellScanner.onBarcodeReadSuccess((event) => {
  //           logger.debug('Honeywell scanner', event.data);
  //           handleBarcodeReadSuccess(event.data);
  //         });
  //       });

  //       return () => {
  //         console.log('aaa');
  //         HoneywellScanner.stopReader().then(() => {
  //           logger.debug('Honeywell scanner released!');
  //           HoneywellScanner.offBarcodeReadSuccess();
  //         });
  //       };
  //     } else {
  //       logger.info('Not using a Honeywell scanner!');
  //     }
  //   } else {
  //     HoneywellScanner.stopReader()
  //       .then(() => {
  //         logger.debug('Honeywell scanner released!');
  //         HoneywellScanner.offBarcodeReadSuccess();
  //       })
  //       .catch(console.log('err'));
  //   }
  // }, [isFocused]);

  const honeywellScanner = useHoneywellScanner({
    onBarcodeReadSuccess: handleBarcodeReadSuccess,
    screen: 'LoadListScreen',
  });
  // console.log('load screen ' + honeywellScanner.isClaimed);

  return (
    <View style={styles.container}>
      <Title
        text="Load Picking"
        description="Scan a load or choose from the list below"
      />
      <Input
        ref={loadInputRef}
        blurOnSubmit={false}
        onChangeText={(text) => {
          onChangeText(text);
        }}
        value={loadInput}
        placeholder="Scan Load barcode"
        containerStyle={styles.inputContainerStyle}
        placeholderTextColor="gray"
        onSubmitEditing={() => {
          onSubmit();
        }}
      />
      <ScrollableCard
        data={memoizedLoads.map((e) => ({
          id: e.loadNo,
          'Load#': e.loadNo,
          Load: e.loadName,
          Customers: e.customers,
          Picked: e.pksPicked,
          'To pick': e.pksToLoad,
          Notes: e.loadNotes,
          Date: e.date,
          Carrier: e.carrier,
          Truck: e.truckTypeName,
          'Weight Picked': e.weightPicked,
          Weight: e.weight,
          PickUp: e.pickup ? 'Yes' : 'No',
          // 'Notes?': isString(e.loadNotes) ? 'Yes' : 'No',
          // 'All picked?': e.pksPicked >= e.pksToLoad ? 'Yes' : 'No',
          isPicked: e.pksPicked >= e.pksToLoad ? true : false,
          // Completed: e.completed ? 'Yes' : 'No',
        }))}
        hiddenItem={['isPicked']}
        compactFields={[
          'Load#',
          'Load',
          // 'Picked',
          // 'To pick',
          'Customers',
          // 'Notes?',
        ]}
        hidden={[]}
        nextScreen="LoadPlanningLoadItem"
        loadListRef={loadListRef}
        onRefresh={() => {
          loadLoadsAsync().catch();
        }}
        refreshing={refreshing}
        navigation={navigation}
        props={props}
        enableHighlightItem
        highlightItemPropName="isPicked"
      />
    </View>
  );
};

export default LoadPlanningLoadScreen;
