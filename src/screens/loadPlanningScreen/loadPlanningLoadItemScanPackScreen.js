import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import HoneywellScanner from 'react-native-honeywell-scanner-v2';
import {Keyboard, View} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Card, Button, Input, Text} from 'react-native-elements';
import {toNumber, isEmpty, isArray} from 'lodash';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import DialogAndroid from 'react-native-dialogs';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import styles from './loadPlanningStyles';
import Title from '../../components/title/title';
import logger from '../../helpers/logger';
import {
  loadConsignmentItems,
  purgeInvalidConsignmentPackets,
  reservePack,
  reservePackStub,
  saveLoadItems,
  unreservePack,
} from '../../reducers/loadPlanning/loadPlanningReducer';
import ScrollableCard from '../../components/scrollableCard/scrollableCardWithCompactView';
import {apiUrlSelector} from '../../selectors/common/commonSelector';
import {
  binPackNoSelector,
  consignmentCustomerSelector,
  consignmentInternalNotesSelector,
  consignmentNotesSelector,
  consignmentPickedSelector,
  consignmentProductDescriptionSelector,
  consignmentToPickSelector,
  consignmentUomSelector,
  isPickedSelector,
  loadIdSelector,
  oldestSelector,
  reservedSelector,
} from '../../selectors/loadPlanning/loadPlanningSelector';
import {displayToast} from '../../helpers/utils';
import {playBadSound} from '../../components/common/playSound';
import useHoneywellScanner from '../../hooks/useHoneywellScanner';

const LoadPlanningLoadItemScanPackScreen = (props) => {
  const dispatch = useDispatch();
  const {appStore, loadPlanningStore} = useSelector((state) => state);
  const {
    token: apiToken,
    username,
    deviceInfo: {androidId, deviceName},
  } = appStore;
  const {refreshing} = loadPlanningStore;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const navigation = useNavigation();
  const [scanPackInput, setScanPackInput] = useState('');
  const [packOptionsInput, setPackOptionsInput] = useState(0);
  const [userAcknowledgedToStay, setUserAcknowledgedToStay] = useState(false);
  const scanPackInputRef = useRef();
  const {route} = props;
  const {
    params: {id: consignmentID},
  } = route;

  const consignmentNotes = consignmentNotesSelector(loadPlanningStore, props);
  const consignmentInternalNotes = consignmentInternalNotesSelector(
    loadPlanningStore,
    props,
  );
  const consignmentCustomer = consignmentCustomerSelector(
    loadPlanningStore,
    props,
  );
  const binPackNo = binPackNoSelector(loadPlanningStore, props);
  const consignmentProductDescription = consignmentProductDescriptionSelector(
    loadPlanningStore,
    props,
  );
  const consignmentPicked = consignmentPickedSelector(loadPlanningStore, props);
  const consignmentToPick = consignmentToPickSelector(loadPlanningStore, props);
  const consignmentUOM = consignmentUomSelector(loadPlanningStore, props);
  const oldest = oldestSelector(loadPlanningStore, props);
  const reserved = reservedSelector(loadPlanningStore, props);
  const consignmentItems = isArray(
    loadPlanningStore.consignmentItems[consignmentID],
  )
    ? loadPlanningStore.consignmentItems[consignmentID].filter(
        (e) => e !== null && e !== undefined,
      )
    : [];
  const loadID = loadIdSelector(loadPlanningStore, props);
  const isPicked = isPickedSelector(loadPlanningStore, props);
  const pickedCount = consignmentItems.filter(
    (e) => e.status === undefined || e.status === 'New',
  ).length;
  const memoizedPickedCount = useMemo(() => pickedCount, [pickedCount]);

  let honeywellScanner = null;

  const clearScanInput = () => {
    // setTimeout(() => {
    if (scanPackInputRef.current) scanPackInputRef.current.clear();
    // }, 50);
  };

  const refocusScanInput = () => {
    // if (honeywellScanner.isClaimed && honeywellScanner.isCompatible) {
    //   displayToast('Internal scanner detected - enabling fast scanning mode');
    //   console.log('Dismissing keyboard');
    //   Keyboard.dismiss();
    // } else if (!honeywellScanner.isCompatible && !honeywellScanner.isClaimed) {
    // setTimeout(() => {
    if (scanPackInputRef.current) scanPackInputRef.current.focus();
    // }, 100);
    // }
  };

  const onSubmit = (input) => {
    const existingPackFound = consignmentItems.filter(
      (e) => e.packetNo?.toLowerCase() === input.toLowerCase(),
    );

    if (
      honeywellScanner &&
      honeywellScanner.isCompatible &&
      honeywellScanner.isClaimed
    ) {
      displayToast(input);
      logger.info(`Scanned ${input}`);
    }

    if (existingPackFound.length > 0) {
      playBadSound();
      displayToast('Are you feeling lucky? Same pack scanned twice');
      if (
        !(
          honeywellScanner &&
          honeywellScanner.isCompatible &&
          honeywellScanner.isClaimed
        )
      ) {
        clearScanInput();
      }
      refocusScanInput();
      return;
    }

    if (packOptionsInput === 0) {
      logger.info(
        `Reserving ${input} for Load ${loadID} Consignment ${consignmentID}`,
      );
      dispatch(reservePackStub(consignmentID, input));
      dispatch(reservePack(apiUrl, apiToken, loadID, consignmentID, input));
    } else {
      logger.info(
        `Start splitting pack ${input} for Load ${loadID} Consignment ${consignmentID}`,
      );
      navigation.navigate('LoadPlanningLoadItemSplitPack', {
        consignmentID,
        packNo: input,
        loadID,
      });
    }

    // User submitted new pack no
    setUserAcknowledgedToStay(true);

    // loadLoadItemsAsync();
    // if (!(honeywellScanner.isCompatible && honeywellScanner.isClaimed)) {
    clearScanInput();
    // }
    refocusScanInput();
  };

  honeywellScanner = useHoneywellScanner({
    onBarcodeReadSuccess: onSubmit,
    screen: 'LoadItemScanPack',
  });

  // useEffect(() => {
  //   if (HoneywellScanner.isCompatible) {
  //     HoneywellScanner.startReader().then((isClaimed) => {
  //       logger.debug(
  //         isClaimed ? 'Honeywell scanner claimed!' : 'Barcode reader is busy',
  //       );
  //       HoneywellScanner.onBarcodeReadSuccess((event) => {
  //         logger.debug('Honeywell scanner', event.data);
  //         onSubmit(event.data);
  //       });
  //     });

  //     return () => {
  //       HoneywellScanner.stopReader().then(() => {
  //         logger.debug('Honeywell scanner released!');
  //         HoneywellScanner.offBarcodeReadSuccess();
  //       });
  //     };
  //   } else {
  //     logger.info('Not using a Honeywell scanner!');
  //   }
  //   // return () => {
  //   //   HoneywellScanner.stopReader().then(() => {
  //   //     logger.debug('Honeywell scanner released!');
  //   //     HoneywellScanner.offBarcodeReadSuccess();
  //   //   });
  //   // };
  // }, []);

  // const pickedCount = useMemo(() => {
  //   if (isArray(consignmentItems)) {
  //     return consignmentItems.filter(
  //       (e) => e.status === 'Reserved' || e.status === 'New',
  //     ).length;
  //   }
  //   return 0;
  // }, [consignmentItems]);

  // const newConsignmentItems = useMemo(() => {
  //   if (isArray(consignmentItems)) {
  //     return consignmentItems.filter((e) => e.status === 'New');
  //   }
  //   return [];
  // }, [consignmentItems]);

  const packOptionsProps = [
    {label: 'Reserve Pack', value: 0},
    {label: 'Split Pack', value: 1},
  ];

  const loadLoadItemsAsync = async () => {
    // _loadLoadItems({apiUrl, apiToken, loadID: route.params.id});

    try {
      const response = await fetch(
        `${apiUrl}/api/LoadPlanning/LoadItems?LoadID=${loadID}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        },
      );

      if (response?.status === 200) {
        const data = await response.json();
        dispatch(saveLoadItems(data));
      } else {
        logger.warn('Unable to load Consignments').catch();
        displayToast('Unable to load Consignments');
      }
    } catch (error) {
      logger.error(error).catch();
      displayToast('Unable to load Consignments');
    }
  };

  const stayOrPopScreen = async () => {
    DialogAndroid.assignDefaults({
      positiveText: 'Yes',
      negativeText: 'No',
    });

    const {action, text} = await DialogAndroid.alert(
      'Item Completed',
      'Stay on this screen?',
    );

    switch (action) {
      case DialogAndroid.actionPositive:
        setUserAcknowledgedToStay(true);
        break;
      case DialogAndroid.actionNegative:
        navigation.pop();
        break;
      case DialogAndroid.actionDismiss:
        break;
      default:
        break;
    }
  };

  useFocusEffect(
    useCallback(() => {
      // if (
      //   !(
      //     honeywellScanner &&
      //     honeywellScanner.isClaimed &&
      //     honeywellScanner.isCompatible
      //   )
      // ) {
      refocusScanInput();
      // }
    }, [consignmentItems]),
  );

  const memoizedConsignmentItems = useMemo(() => {
    return consignmentItems.map((e) => ({
      ...e,
      status: e.status || 'Reserved',
    }));
    // return [];
  }, [consignmentItems]);

  const getConsignmentDetailsAsync = async () => {
    dispatch(loadConsignmentItems(apiUrl, apiToken, consignmentID));

    setPackOptionsInput(
      consignmentUOM === 'BOX' ||
        consignmentUOM === 'SHT' ||
        consignmentUOM === 'EA' ||
        consignmentUOM === 'P'
        ? 1
        : 0,
    );
  };

  useEffect(() => {
    logger.debug(
      `${username} (${deviceName} or ${androidId}) on Load ${route.params.id} Consignment ${consignmentID} pack scanning screen`,
    );
    // loadLoadItemsAsync();
    getConsignmentDetailsAsync().catch();

    refocusScanInput();
  }, []);

  const onChangeText = (text) => {
    setScanPackInput(text);
  };

  const onUnreserve = (packNo) => {
    dispatch(unreservePack(apiUrl, apiToken, loadID, consignmentID, packNo));
    logger.info(
      `Unreserve pack ${packNo} for Load ${loadID} Consignment ${consignmentID}`,
    );
    // loadLoadItemsAsync();
    refocusScanInput();
  };

  useEffect(() => {
    setScanPackInput(binPackNo);
    // refocusScanInput();
  }, [binPackNo]);

  useEffect(() => {
    const consignmentToPickInt = toNumber(consignmentToPick);
    const consignmentPickedInt = toNumber(consignmentPicked);

    logger.debug(
      `Pick status: consignmentPicked ${consignmentPickedInt} consignmentToPick ${consignmentToPickInt} ${isPicked} ${
        consignmentPickedInt >= consignmentToPickInt
      }`,
    );

    if (!userAcknowledgedToStay) {
      logger.debug(`Consignment ${consignmentID} picked. Continue?`);
      if (
        consignmentToPickInt > 0 &&
        consignmentPickedInt >= consignmentToPickInt &&
        isPicked
      ) {
        stayOrPopScreen();
      }
    } else if (consignmentToPickInt > 0 && isPicked) {
      logger.debug(`Consignment ${consignmentID} fully picked. Can pop!`);
      // if (isPicked && prevProps.isPicked) {
      //   if (!this.state.userAcknowledgedToStay) this.stayOrPopScreen().done();
      // } else if (isPicked && !prevProps.isPicked) {
      //   navigation.pop();
      // }
      // navigation.pop();
    }
  }, [consignmentPicked, consignmentToPick]);

  // 0 reserve pack
  // 1 split pack

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Title text="Scan Pack" />
        <Button
          // containerStyle={styles.buttonContainerStyle}
          style={styles.buttonStyle}
          type="clear"
          // raised
          title="Pack List"
          onPress={() => {
            navigation.navigate('LoadPlanningLoadItemPackList', {
              consignmentID,
            });
          }}
        />
      </View>
      <Card containerStyle={styles.packDetailsContainer}>
        <View>
          <Text>{consignmentCustomer}</Text>
          <Text style={{fontWeight: 'bold'}}>
            {consignmentProductDescription}
          </Text>
          <Text>
            Picked:{' '}
            {pickedCount > consignmentPicked ? pickedCount : consignmentPicked}{' '}
            (To pick: {consignmentToPick.toString().trim()}){' '}
            {pickedCount - consignmentPicked > 0 &&
              `...${pickedCount - consignmentPicked} requests in queue`}
          </Text>
          {binPackNo != null && binPackNo.length > 0 ? (
            <Text>Bin: {binPackNo}</Text>
          ) : null}
          {reserved != null && reserved.length > 0 ? (
            <Text>Reserved: {reserved}</Text>
          ) : null}
          {oldest != null && oldest.length > 0 ? (
            <Text>Oldest: {oldest}</Text>
          ) : null}
          {consignmentNotes != null && consignmentNotes.length > 0 ? (
            <Text>Notes: {consignmentNotes}</Text>
          ) : null}
          {consignmentInternalNotes != null &&
          consignmentInternalNotes.length > 0 ? (
            <Text>Internal notes: {consignmentInternalNotes}</Text>
          ) : null}
          {/* {newConsignmentItems.length > 0 ? ( */}
          {/*  <Text style={{fontWeight: 'bold', color: 'red'}}> */}
          {/*    Reminder: {newConsignmentItems.length} pack(s) queued. Please */}
          {/*    continue scanning... */}
          {/*  </Text> */}
          {/* ) : null} */}
        </View>
      </Card>
      <Input
        ref={scanPackInputRef}
        // blurOnSubmit={false}
        value={scanPackInput}
        onChangeText={(text) => {
          onChangeText(text);
        }}
        placeholder="Scan pack here"
        placeholderTextColor="gray"
        onSubmitEditing={(event) => {
          // console.log(event.nativeEvent.text);
          onSubmit(event.nativeEvent.text);
        }}
      />
      <View style={styles.packOptionsContainer}>
        <Text>Options: </Text>
        <RadioForm formHorizontal animation>
          {packOptionsProps.map((obj, i) => (
            <RadioButton labelHorizontal key={i.toString()}>
              <RadioButtonInput
                obj={obj}
                index={i}
                isSelected={packOptionsInput === i}
                onPress={(value) => {
                  setPackOptionsInput(value);
                }}
                borderWidth={1}
                // buttonInnerColor="#e74c3c"
                // buttonOuterColor={packOptionsInput === i ? '#2196f3' : '#000'}
                buttonSize={7}
                buttonOuterSize={15}
                buttonStyle={{}}
                buttonWrapStyle={{alignment: 'bottom', marginLeft: 10}}
              />
              <RadioButtonLabel
                obj={obj}
                index={i}
                labelHorizontal
                onPress={(value) => {
                  setPackOptionsInput(value);
                }}
                labelStyle={{fontSize: 15}}
                labelWrapStyle={{justifyContent: 'center'}}
              />
            </RadioButton>
          ))}
        </RadioForm>
      </View>
      <ScrollableCard
        data={consignmentItems.map((e) => ({
          id: e.packetNo,
          'Pack#': e.packetNo,
          Product: e.productCode,
          Pieces: e.pieces,
          Lineal: e.lineal,
          NetCube: e.netCube,
          Status: e.status || 'Reserved',
          // 'Last Update': Moment(e.lastUpdate).format('DD-MM-YY'),
          swipeableRightButtons: [
            [
              [
                styles.rightSwipeItem,
                {
                  // marginBottom: 5,
                  backgroundColor: '#FF0000',
                },
              ],
              () => {
                onUnreserve(e.packetNo);
              },
              'Unreserve',
            ],
          ],
        }))}
        // nextScreen="LoadPlanningLoadItem"
        compactFields={['Pack#', 'Status']}
        // loadListRef={loadListRef}
        onRefresh={() => {
          dispatch(purgeInvalidConsignmentPackets(consignmentID));
          dispatch(loadConsignmentItems(apiUrl, apiToken, consignmentID));
        }}
        refreshing={refreshing}
        navigation={navigation}
        props={props}
      />
      <Button
        buttonStyle={styles.wideButtonStyle}
        containerStyle={styles.buttonContainerStyle}
        title="Back"
        onPress={() => {
          navigation.pop();
        }}
      />
    </View>
  );
};

export default LoadPlanningLoadItemScanPackScreen;
