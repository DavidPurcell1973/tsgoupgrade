import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {Input} from 'react-native-elements';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import Moment from 'moment';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import styles from './orderPickingStyles';
import {
  clearOrderItems,
  loadOrders,
  updateOrderInput,
} from '../../reducers/orderPicking/orderPickingReducer';
import ScrollableCard from '../../components/scrollableCard/scrollableCardWithCompactView';
import Title from '../../components/title/title';
import {apiUrlSelector} from '../../selectors/common/commonSelector';

const OrderPickingOrderScreen = (props) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {appStore, orderPickingStore} = useSelector((state) => state);
  const {
    token: apiToken,
    username,
    deviceInfo: {androidId, deviceName},
    authorizedApps: apps,
  } = appStore;
  const {orders, refreshing} = orderPickingStore;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const [orderInput, setOrderInput] = useState('');
  const orderInputRef = useRef();
  const memoizedOrders = useMemo(() => orders, [orders]);

  const loadOrdersAsync = async () => {
    dispatch(loadOrders(apiUrl, apiToken));
  };

  const refocusScanInput = () => {
    setTimeout(() => {
      if (orderInputRef.current) orderInputRef.current.focus();
    }, 100);
  };

  useFocusEffect(
    useCallback(() => {
      refocusScanInput();
    }, [memoizedOrders]),
  );

  useEffect(() => {
    (async () => {
      await loadOrdersAsync();
    })();
  }, []);

  const onChangeText = (text) => {
    dispatch(updateOrderInput(text));
  };

  const onSubmit = () => {
    dispatch(clearOrderItems());
    navigation.navigate('OrderPickingOrderItem', {id: orderInput});
    refocusScanInput();
  };

  if (!apps.includes('OrderPicking')) {
    return (
      <View style={[styles.container, {marginTop: 10}]}>
        <Title text="Order Picking app is not enabled - please contact TimberSmart." />
      </View>
    );
  } 
    return (
      <View style={styles.container}>
        <Title
          text="Order Picking"
          description="Scan an order no or choose from the list below"
        />
        <Input
          ref={orderInputRef}
          blurOnSubmit={false}
          onChangeText={(text) => {
            onChangeText(text);
          }}
          placeholder="Scan order no here"
          containerStyle={styles.inputContainerStyle}
          placeholderTextColor="gray"
          onSubmitEditing={() => {
            onSubmit();
          }}
        />
        <ScrollableCard
          data={memoizedOrders.map((e) => ({
            id: e.orderNo,
            'Order#': e.orderNo,
            Customer: e.customerName,
            'Customer Ref': e.customerRef,
            Date: Moment(e.date).format('DD-MM-YY'),
            Required: Moment(e.required).format('DD-MM-YY'),
            Description: e.description,
            'Deliver To': e.delivertoName,
            'Address 1': e.delivertoAddress1,
            City: e.delivertoCity,
            Type: e.orderType,
            Term: e.paymentTerm,
            'Picking Inst': e.pickingInstructions,
            Instructions: e.instructions,
          }))}
          // hiddenItem={['swipeableRightButtons', 'id', 'Date']}
          nextScreen="OrderPickingOrderItem"
          compactFields={[
            'Order#',
            'Customer Ref',
            'Picking Inst',
            'Instructions',
          ]}
          onRefresh={() => {
            dispatch(loadOrders(apiUrl, apiToken));
          }}
          refreshing={refreshing}
          navigation={navigation}
        />
      </View>
    );
  
};

// OrderPickingOrderScreen.defaultProps = {
//   orders: [],
//   apiUrl: '',
//   apiToken: '',
//   refreshing: false,
// };
//
// OrderPickingOrderScreen.propTypes = {
//   navigation: PropTypes.object.isRequired,
//   updateOrderInput: PropTypes.func.isRequired,
//   loadOrders: PropTypes.func.isRequired,
//   orderInput: PropTypes.string.isRequired,
//   loadOfflineOrders: PropTypes.func.isRequired,
//   orders: PropTypes.array,
//   refreshing: PropTypes.bool,
//   apiUrl: PropTypes.string,
//   apps: PropTypes.array.isRequired,
//   apiToken: PropTypes.string,
// };
//
// const mapStateToProps = state => ({
//   orderInput: state.orderPickingStore.orderInput,
//   orders: state.orderPickingStore.orders,
//   apiUrl: apiUrlSelector(state),
//   apiToken: state.appStore.token,
//   refreshing: state.orderPickingStore.refreshing,
//   apps: state.appStore.authorizedApps,
// });
//
// const mapDispatchToProps = {
//   updateOrderInput,
//   loadOrders,
//   loadOfflineOrders,
// };

export default OrderPickingOrderScreen;
