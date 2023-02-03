import React, {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {isArray} from 'lodash';
import {Button, Divider, Overlay} from 'react-native-elements';
import styles from './orderPickingStyles';
import Title from '../../components/title/title';
import ScrollableCard from '../../components/scrollableCard/scrollableCard';
import {loadOrderItems} from '../../reducers/orderPicking/orderPickingReducer';
import {apiUrlSelector} from '../../selectors/common/commonSelector';
import TwoColumnsDataGrid from '../../components/twoColumnsDataGrid';

const OrderPickingOrderItemScreen = (props) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const {appStore, orderPickingStore} = useSelector((state) => state);
  const {
    token: apiToken,
    username,
    deviceInfo: {androidId, deviceName},
    authorizedApps: apps,
  } = appStore;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const {orderItems, refreshing} = orderPickingStore;
  const {route} = props;

  const loadOrderItemsAsync = async () => {
    dispatch(loadOrderItems({apiUrl, apiToken, orderNo: route.params.id}));
  };

  const headers = [
    {accessor: 'Order#', label: 'Order#'},
    {accessor: 'City', label: 'City'},
    {accessor: 'Customer', label: 'Customer'},
    {accessor: 'Customer Ref', label: 'Customer Ref'},
    {accessor: 'Date', label: 'Date'},
    {accessor: 'Deliver To', label: 'Deliver To'},
    {accessor: 'Description', label: 'Description'},
    {accessor: 'Instructions', label: 'Instructions'},
    {accessor: 'Picking Inst', label: 'Picking Inst'},
    {accessor: 'Required', label: 'Required'},
    {accessor: 'Term', label: 'Term'},
    {accessor: 'Type', label: 'Type'},
    {accessor: 'Address 1', label: 'Address 1'},
  ];

  useEffect(() => {
    (async () => {
      await loadOrderItemsAsync();
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Title
        text={
          orderItems.length > 0
            ? `Order ${orderItems[0].orderNo}`
            : 'Loading...'
        }
        description="Select an order item"
      />
      {isArray(orderItems) && orderItems.length > 0 && (
        <ScrollableCard
          data={orderItems.map((e) => ({
            id: e.orderItemId,
            Order: e.orderNo,
            Item: e.orderItem,
            'Order#': `${e.orderNo}/${e.orderItem}`,
            Qty: e.qty,
            UOM: e.uom,
            Picked: e.picked,
            Product: e.productDescription,
            'Product Code': e.productCode,
            Bin: e.bin,
            Tally: e.orderTally,
            Reserved: e.reserved,
            Oldest: e.oldest,
            Notes: e.notes,
            'Internal Notes': e.internalNotes,
            Completed: e.isPicked,
            // Certification: e.certification,
          }))}
          nextScreen="OrderPickingOrderItemScanPack"
          hiddenItem={['Order', 'Item', 'id', 'Completed']}
          onRefresh={() => {
            loadOrderItemsAsync().catch();
          }}
          refreshing={refreshing}
          navigation={navigation}
          enableHighlightItem
          highlightItemPropName="Completed"
        />
      )}
      <Overlay
        isVisible={isHeaderVisible}
        onBackdropPress={() => setIsHeaderVisible(false)}
        overlayStyle={styles.queueContainerStyle}>
        <ScrollView>
          <Button
            // buttonStyle={styles.buttonStyle}
            buttonStyle={styles.wideButtonStyle}
            containerStyle={styles.buttonContainerStyle}
            title="Continue"
            onPress={() => {
              setIsHeaderVisible(false);
            }}
          />
          <Divider style={{marginTop: 10, marginBottom: 10}} />
          <TwoColumnsDataGrid
            title="Load Details"
            headers={headers}
            hidden={['id']}
            data={route.params}
          />
        </ScrollView>
      </Overlay>
    </View>
  );
};

// OrderPickingOrderItemScreen.defaultProps = {
//   orderItems: [],
//   refreshing: false,
// };
//
// OrderPickingOrderItemScreen.propTypes = {
//   navigation: PropTypes.object.isRequired,
//   loadOrderItems: PropTypes.func.isRequired,
//   clearOrderItems: PropTypes.func.isRequired,
//   orderItems: PropTypes.array,
//   apiUrl: PropTypes.string.isRequired,
//   apiToken: PropTypes.string.isRequired,
//   refreshing: PropTypes.bool,
// };
//
// const mapStateToProps = state => ({
//   orderItems: state.orderPickingStore.orderItems,
//   apiUrl: apiUrlSelector(state),
//   apiToken: state.appStore.token,
//   refreshing: state.orderPickingStore.refreshing,
// });
//
// const mapDispatchToProps = {
//   loadOrderItems,
//   loadOfflineOrderItems,
//   clearOrderItems,
// };

export default OrderPickingOrderItemScreen;
