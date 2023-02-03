import React, {Component} from 'react';
import {View} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {ButtonGroup, Text} from 'react-native-elements';
import styles from '../../styles/styles';
import Title from '../../components/title/title';
import {
  loadOrderNoOrderItemPacks,
  loadOrderNoOrderItemReservedPacks,
  updatePackListOptionsInput,
} from '../../reducers/orderPicking/orderPickingReducer';
import ScrollableCard from '../../components/scrollableCard/scrollableCard';
import store from '../../store/configureStore';
import {apiUrlSelector} from '../../selectors/common/commonSelector';

class OrderItemOrderItemPackListScreen extends Component {
  constructor(props) {
    super(props);
    this.loadPackListAsync().done();
  }

  availablePacks = () => <Text>Available</Text>;

  reservedPacks = () => <Text>Reserved</Text>;

  loadPackListAsync = async () => {
    const {
      apiToken,
      apiUrl,
      loadOrderNoOrderItemPacks: _loadOrderNoOrderItemPacks,
      loadOrderNoOrderItemReservedPacks: _loadOrderNoOrderItemReservedPacks,
      // packListOptionsInput,
      orderNo,
      orderItem,
    } = this.props;

    _loadOrderNoOrderItemPacks(apiUrl, apiToken, orderNo, orderItem);
    _loadOrderNoOrderItemReservedPacks(apiUrl, apiToken, orderNo, orderItem);

    // if (packListOptionsInput === 0) {
    //   console.log('loadOrderNoOrderItemPacks');
    //   _loadOrderNoOrderItemPacks(apiUrl, apiToken, orderNo, orderItem);
    // } else {
    //   console.log('loadOrderNoOrderItemReservedPacks');
    //   _loadOrderNoOrderItemReservedPacks(apiUrl, apiToken, orderNo, orderItem);
    // }
  };

  render() {
    const {
      updatePackListOptionsInput: doUpdatePackListOptionsInput,
      packListOptionsInput,
      orderItemPacks,
      orderItemReservedPacks,
      orderNo,
      apiUrl,
      apiToken,
      orderItem,
      refreshing,
      loadOrderNoOrderItemPacks: doLoadOrderNoOrderItemPacks,
      loadOrderNoOrderItemReservedPacks: doLoadOrderNoOrderItemReservedPacks,
      navigation,
    } = this.props;

    const buttons = [
      {element: this.availablePacks},
      {element: this.reservedPacks},
    ];

    return (
      <View style={styles.container}>
        <Title text={`Pack List for ${orderNo}/${orderItem}`} />
        <ButtonGroup
          onPress={selectedIndex => {
            doUpdatePackListOptionsInput(selectedIndex);
          }}
          selectedIndex={packListOptionsInput}
          buttons={buttons}
          // containerStyle={{ height: 100 }}
        />
        {packListOptionsInput === 0 &&
        orderItemPacks != null &&
        orderItemPacks.length > 0 ? (
          <ScrollableCard
            data={orderItemPacks.map(e => ({
              id: e.packetNo,
              'Pack#': e.packetNo,
              Product: e.productCode,
              Pieces: e.pieces,
              Lineal: e.lineal,
              Cube: e.cube,
              'Order#': e.orderNo,
              'Order Item': e.orderItem,
            }))}
            loadListRef={this.loadListRef}
            onRefresh={() => {
              store.dispatch(
                doLoadOrderNoOrderItemPacks(
                  apiUrl,
                  apiToken,
                  orderNo,
                  orderItem,
                ),
              );
            }}
            refreshing={refreshing}
            navigation={navigation}
            props={this.props}
          />
        ) : packListOptionsInput === 1 &&
          orderItemReservedPacks != null &&
          orderItemReservedPacks.length > 0 ? (
          <ScrollableCard
            data={orderItemReservedPacks.map(e => ({
              id: e.packetNo,
              'Pack#': e.packetNo,
              Product: e.productCode,
              Pieces: e.pieces,
              Lineal: e.lineal,
              Cube: e.cube,
              'Order#': e.orderNo,
              'Order Item': e.orderItem,
            }))}
            loadListRef={this.loadListRef}
            onRefresh={() => {
              store.dispatch(
                doLoadOrderNoOrderItemReservedPacks(
                  apiUrl,
                  apiToken,
                  orderNo,
                  orderItem,
                ),
              );
            }}
            refreshing={refreshing}
            navigation={navigation}
            props={this.props}
          />
        ) : (
          <Text>No packs found</Text>
        )}
      </View>
    );
  }
}

OrderItemOrderItemPackListScreen.defaultProps = {};

OrderItemOrderItemPackListScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  apiUrl: PropTypes.string.isRequired,
  apiToken: PropTypes.string.isRequired,
  updatePackListOptionsInput: PropTypes.func.isRequired,
  loadOrderNoOrderItemPacks: PropTypes.func.isRequired,
  loadOrderNoOrderItemReservedPacks: PropTypes.func.isRequired,
  packListOptionsInput: PropTypes.number.isRequired,
  orderItemPacks: PropTypes.array,
  orderItemReservedPacks: PropTypes.array,
  orderNo: PropTypes.number.isRequired,
  orderItem: PropTypes.number.isRequired,
};

const mapStateToProps = (state, props) => ({
  apiUrl: apiUrlSelector(state),
  apiToken: state.appStore.token,
  packListOptionsInput: state.orderPickingStore.packListOptionsInput,
  orderItemPacks: state.orderPickingStore.orderItemPacks,
  orderItemReservedPacks: state.orderPickingStore.orderItemReservedPacks,
  orderNo: props.route.params.orderNo,
  orderItem: props.route.params.orderItem,
});

const mapDispatchToProps = {
  updatePackListOptionsInput,
  loadOrderNoOrderItemPacks,
  loadOrderNoOrderItemReservedPacks,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OrderItemOrderItemPackListScreen);
