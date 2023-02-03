import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Card, Button, Input, Text} from 'react-native-elements';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import DialogAndroid from 'react-native-dialogs';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {isArray} from 'lodash';
import styles from './orderPickingStyles';
import Title from '../../components/title/title';
import {
  autoSplitFromBin,
  getSplitPackDetails,
  getWorkSplitFromBin,
  loadOrderItemItems,
  loadOrderItems,
  reservePack,
  reservePackStub,
  unreservePack,
  updatePackOptionsInput,
  updateScanPackInput,
} from '../../reducers/orderPicking/orderPickingReducer';
import ScrollableCard from '../../components/scrollableCard/scrollableCard';
import {apiUrlSelector} from '../../selectors/common/commonSelector';
import {
  binPackNoSelector,
  isBinSelector,
  isPickedSelector,
  oldestSelector,
  orderInternalNotesSelector,
  orderNotesSelector,
  orderPickedSelector,
  orderProductDescriptionSelector,
  orderTallySelector,
  orderToPickSelector,
  reservedSelector,
} from '../../selectors/orderPicking/orderPickingSelector';
import logger from '../../helpers/logger';

const OrderPickingOrderItemScanPackScreen = (props) => {
  const scanPackInputRef = useRef();
  const dispatch = useDispatch();
  const {appStore, orderPickingStore} = useSelector((state) => state);
  const {
    token: apiToken,
    username,
    deviceInfo: {androidId, deviceName},
  } = appStore;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const {refreshing, orderItemItems} = orderPickingStore;
  const {route} = props;
  const navigation = useNavigation();
  const [scanPackInput, setScanPackInput] = useState('');
  const [packOptionsInput, setPackOptionsInput] = useState(0);
  const orderNotes = orderNotesSelector(orderPickingStore, props);
  const orderInternalNotes = orderInternalNotesSelector(
    orderPickingStore,
    props,
  );
  const orderProductDescription = orderProductDescriptionSelector(
    orderPickingStore,
    props,
  );
  const binPackNo = binPackNoSelector(orderPickingStore, props);
  const isBin = isBinSelector(orderPickingStore, props);
  const reserved = reservedSelector(orderPickingStore, props);
  const oldest = oldestSelector(orderPickingStore, props);
  const isPicked = isPickedSelector(orderPickingStore, props);
  const [userAcknowledgedToStay, setUserAcknowledgedToStay] = useState(false);
  const orderTally = orderTallySelector(orderPickingStore, props);
  const orderPicked = orderPickedSelector(orderPickingStore, props);
  const orderToPick = orderToPickSelector(orderPickingStore, props);
  const itemUOM = route.params.UOM;
  const orderNo = route.params.Order;
  const orderItem = route.params.Item;
  const memoizedOrderItemItems = useMemo(
    () => isArray(orderItemItems[`${orderNo}_${orderItem}`]) ? orderItemItems[`${orderNo}_${orderItem}`] : [],
    [orderItemItems],
  );
  const packOptionsProps = [
    {label: 'Reserve Pack', value: 0},
    {label: 'Split Pack', value: 1},
  ];

  const refocusScanInput = () => {
    setTimeout(() => {
      if (scanPackInputRef.current) scanPackInputRef.current.focus();
    }, 100);
  };

  const clearScanInput = () => {
    setTimeout(() => {
      if (scanPackInputRef.current) scanPackInputRef.current.clear();
    }, 50);
  };

  useFocusEffect(
    useCallback(() => {
      clearScanInput();
      refocusScanInput();
    }, [memoizedOrderItemItems]),
  );

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
      default:
        break;
    }
  };

  const goToSplitPackAndLoadAsync = () => {
    // _getSplitPackDetails(apiUrl, apiToken, orderNo, orderItem, scanPackInput);
    // _getWorkSplitFromBin(apiUrl, apiToken, orderNo, orderItem, scanPackInput);

    navigation.navigate('OrderPickingOrderItemSplitPack', {
      orderNo,
      orderItem,
      scanPackInput,
    });
  };

  const doAutoSplitFromBin = async () => {
    // const {
    //   orderNo,
    //   orderItem,
    //   orderToPick,
    //   autoSplitFromBin: _autoSplitFromBin,
    //   orderPicked,
    //   binPackNo,
    // } = this.props;

    DialogAndroid.assignDefaults({
      positiveText: 'Yes',
      negativeText: 'No',
    });

    if (
      binPackNo !== null &&
      binPackNo.toLowerCase() === scanPackInput.toLowerCase() &&
      parseInt(orderPicked, 10) === 0
    ) {
      const {action, text} = await DialogAndroid.alert(
        'Split From Bin',
        `Automatically split ${orderToPick} from Bin?`,
      );

      switch (action) {
        case DialogAndroid.actionPositive:
          dispatch(
            autoSplitFromBin(
              apiUrl,
              apiToken,
              orderNo,
              orderItem,
              scanPackInput,
            ),
          );
          break;
        case DialogAndroid.actionNegative:
          goToSplitPackAndLoadAsync(orderNo, orderItem, scanPackInput);
          break;
        default:
          break;
      }
    } else {
      goToSplitPackAndLoadAsync(orderNo, orderItem, scanPackInput);
    }
  };

  const loadOrderItemPacksAsync = async () => {
    dispatch(loadOrderItemItems(apiUrl, apiToken, orderNo, orderItem));

    dispatch(
      updatePackOptionsInput(
        itemUOM === 'BOX' ||
          itemUOM === 'SHT' ||
          itemUOM === 'EA' ||
          itemUOM === 'P'
          ? 1
          : 0,
      ),
    );
  };

  useEffect(() => {
    logger.debug(
      `${username} (${deviceName} or ${androidId}) on Order ${orderNo} Item ${orderItem} pack scanning screen`,
    );
    // loadLoadItemsAsync();
    loadOrderItemPacksAsync().catch();

    refocusScanInput();
  }, []);

  const onChangeText = (text) => {
    setScanPackInput(text);
  };

  const onSubmit = () => {
    if (packOptionsInput === 0) {
      dispatch(reservePackStub(orderNo, orderItem, scanPackInput));
      dispatch(
        reservePack(apiUrl, apiToken, orderNo, orderItem, scanPackInput),
      );
    } else if (!isPicked) {
      doAutoSplitFromBin().catch();
    } else {
      navigation.pop();
    }

    refocusScanInput();
  };

  const onUnreserve = (packNo) => {};

  useEffect(() => {
    logger.debug(`${orderPicked} ${orderToPick} ${isPicked}`);
    if (!userAcknowledgedToStay) {
      logger.debug(
        orderToPick > 0 && orderPicked >= orderToPick,
      );
      if (
        orderToPick > 0 &&
        orderPicked >= orderToPick &&
        isPicked
      ) {
        stayOrPopScreen();
      }
    } else if (
      orderToPick > 0 &&
      orderPicked >= orderToPick
    ) {
      navigation.pop();
    }
  }, [orderToPick, orderPicked]);

  // 0 reserve pack
  // 1 split pack

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Title text="Scan Pack" />
        <Button
          style={styles.buttonStyle}
          type="clear"
          title="Pack List"
          onPress={() => {
            navigation.navigate('OrderItemOrderItemPackList', {
              orderNo,
              orderItem,
            });
          }}
        />
      </View>
      <Card containerStyle={styles.packDetailsContainer}>
        <View>
          <Text style={{fontWeight: 'bold'}}>
            Order {orderNo}/{orderItem}: {orderProductDescription}
          </Text>
          <Text>
            Picked: {orderPicked} (To pick: {orderToPick})
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
          {orderNotes != null && orderNotes.length > 0 ? (
            <Text>Notes: {orderNotes}</Text>
          ) : null}
          {orderInternalNotes != null && orderInternalNotes.length > 0 ? (
            <Text>Internal notes: {orderInternalNotes}</Text>
          ) : null}
        </View>
      </Card>
      <Input
        ref={scanPackInputRef}
        blurOnSubmit={false}
        onChangeText={(text) => {
          onChangeText(text);
        }}
        placeholder="Scan pack here"
        placeholderTextColor="gray"
        onSubmitEditing={() => {
          onSubmit();
        }}
      />
      <View style={styles.packOptionsContainer}>
        <Text>Options: </Text>
        <RadioForm
          // radio_props={packOptionsProps}
          // initial={packOptionsInput}
          formHorizontal
          animation
          // onPress={(value) => { _updatePackOptionsInput(value); }}
        >
          {packOptionsProps.map((obj, i) => (
            <RadioButton labelHorizontal key={i.toString()}>
              <RadioButtonInput
                obj={obj}
                index={i}
                isSelected={packOptionsInput === i}
                onPress={(value) => {
                  setPackOptionsInput(value)
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
                  dispatch(updatePackOptionsInput(value));
                }}
                labelStyle={{fontSize: 15}}
                labelWrapStyle={{justifyContent: 'center'}}
              />
            </RadioButton>
          ))}
        </RadioForm>
      </View>
      <ScrollableCard
        data={memoizedOrderItemItems.map((e) => ({
          id: e.packetNo,
          'Pack#': e.packetNo,
          Product: e.productCode,
          Pieces: e.pieces,
          Lineal: e.lineal,
          NetCube: e.netCube,
          Status: e.status,
          // 'Last Update': Moment(e.lastUpdate).format('DD-MM-YY'),
          swipeableRightButtons: [
            [
              [styles.rightSwipeItem, {backgroundColor: '#FF0000'}],
              () => {
                dispatch(
                  unreservePack(
                    apiUrl,
                    apiToken,
                    orderNo,
                    orderItem,
                    e.packetNo,
                  ),
                );
              },
              'Unreserve',
            ],
          ],
        }))}
        onRefresh={() => {
          dispatch(loadOrderItemItems(apiUrl, apiToken, orderNo, orderItem));
        }}
        refreshing={refreshing}
        navigation={navigation}
      />
    </View>
  );
  // }
};

// OrderPickingOrderItemScanPackScreen.defaultProps = {
//   apiUrl: '',
//   apiToken: '',
//   orderTally: '',
//   orderNotes: '',
//   binPackNo: null,
//   orderInternalNotes: '',
//   orderItemItems: [],
//   consignmentPicked: '0',
//   oldest: null,
//   reserved: null,
//   isPicked: false,
//   isBin: false,
// };
//
// OrderPickingOrderItemScanPackScreen.propTypes = {
//   navigation: PropTypes.object.isRequired,
//   orderPicked: PropTypes.string,
//   orderToPick: PropTypes.string.isRequired,
//   orderNotes: PropTypes.string,
//   orderInternalNotes: PropTypes.string,
//   orderProductDescription: PropTypes.string.isRequired,
//   itemUOM: PropTypes.string.isRequired,
//   orderTally: PropTypes.string,
//   apiUrl: PropTypes.string,
//   apiToken: PropTypes.string,
//   binPackNo: PropTypes.string,
//   oldest: PropTypes.string,
//   reserved: PropTypes.string,
//   isPicked: PropTypes.bool,
//   isBin: PropTypes.bool,
//   packOptionsInput: PropTypes.number.isRequired,
//   updateScanPackInput: PropTypes.func.isRequired,
//   getSplitPackDetails: PropTypes.func.isRequired,
//   getWorkSplitFromBin: PropTypes.func.isRequired,
//   autoSplitFromBin: PropTypes.func.isRequired,
//   updatePackOptionsInput: PropTypes.func.isRequired,
//   loadOrderItems: PropTypes.func.isRequired,
//   orderItemItems: PropTypes.array,
//   orderNo: PropTypes.number.isRequired,
//   orderItem: PropTypes.number.isRequired,
// };
//
// const mapStateToProps = (state, props) => ({
//   apiUrl: apiUrlSelector(state),
//   apiToken: state.appStore.token,
//   orderNotes: orderNotesSelector(state, props),
//   orderInternalNotes: orderInternalNotesSelector(state, props),
//   orderProductDescription: orderProductDescriptionSelector(state, props),
//   binPackNo: binPackNoSelector(state, props),
//   isBin: isBinSelector(state, props),
//   reserved: reservedSelector(state, props),
//   oldest: oldestSelector(state, props),
//   isPicked: isPickedSelector(state, props),
//   orderTally: orderTallySelector(state, props),
//   orderPicked: orderPickedSelector(state, props),
//   orderToPick: orderToPickSelector(state, props),
//   itemUOM: props.route.params.UOM,
//   scanPackInput: state.orderPickingStore.scanPackInput,
//   packOptionsInput: state.orderPickingStore.packOptionsInput,
//   orderItemItems:
//     state.orderPickingStore.orderItemItems[
//       `${props.route.params.Order}_${props.route.params.Item}`
//     ],
//   orderNo: props.route.params.Order,
//   orderItem: props.route.params.Item,
//   refreshing: state.orderPickingStore.refreshing,
// });
//
// const mapDispatchToProps = {
//   updateScanPackInput,
//   updatePackOptionsInput,
//   loadOrderItemItems,
//   autoSplitFromBin,
//   reservePack,
//   reservePackStub,
//   unreservePack,
//   getSplitPackDetails,
//   getWorkSplitFromBin,
//   loadOrderItems,
// };

export default OrderPickingOrderItemScanPackScreen;
