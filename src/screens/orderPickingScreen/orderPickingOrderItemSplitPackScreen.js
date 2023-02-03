import React, {Component} from 'react';
import {View} from 'react-native';
import {connect} from 'react-redux';
import has from 'lodash/has';
import PropTypes from 'prop-types';
import {Dropdown} from 'react-native-material-dropdown-no-proptypes';
import {Button, Card, Input, Text} from 'react-native-elements';
import styles from './orderPickingStyles';
import Title from '../../components/title/title';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import {
  addToSplitPackSummary,
  addToWorkSplitFromBin,
  deleteFromWorkSplitFromBin,
  getSplitPackDetails,
  getWorkSplitFromBin,
  loadOrderItemItems,
  splitPack,
  updateSplitCountInput,
  updateSplitPackLengthDropdownInput,
} from '../../reducers/orderPicking/orderPickingReducer';
import store from '../../store/configureStore';
import {displayToast} from '../../helpers/utils';
import ScrollableCard from '../../components/scrollableCard/scrollableCard';
import {apiUrlSelector} from '../../selectors/common/commonSelector';

class OrderPickingOrderItemSplitPackScreen extends Component {
  constructor(props) {
    super(props);
    this.splitCountInputRef = React.createRef();
    this.getWorkSplitBinAsync().done();
    this.binTallies = [];
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {isPicked, navigation} = this.props;

    if (isPicked && prevProps.isPicked) {
    } else if (isPicked && !prevProps.isPicked) {
      navigation.pop();
    }
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.splitCountInputRef.current) {
        this.splitCountInputRef.current.focus();
      }
    }, 100);
  }

  getWorkSplitBinAsync = async () => {
    const {
      apiToken,
      apiUrl,
      getSplitPackDetails: _getSplitPackDetails,
      getWorkSplitFromBin: _getWorkSplitFromBin,
      orderNo,
      orderItem,
      scanPackInput: packNo,
    } = this.props;

    _getSplitPackDetails(apiUrl, apiToken, orderNo, orderItem, packNo);
    _getWorkSplitFromBin(apiUrl, apiToken, orderNo, orderItem, packNo);
  };

  onSplitCountInputChangeText = (text) => {
    const {updateSplitCountInput: _updateSplitCountInput} = this.props;

    if (Number.isInteger(parseInt(text, 10)) && parseInt(text, 10) > 0) {
      _updateSplitCountInput(parseInt(text, 10));
      // } else {
      //   _updateSplitCountInput(parseInt(0, 10));
    }
  };

  //   // Not sure why this wont work as a pure function
  // onDeleteSplitSubmit = (packNo, splitBinID) => {
  //   console.log('onDeleteSplitSubmit');
  //
  //   const {
  //     deleteFromWorkSplitFromBin: _deleteFromWorkSplitFromBin,
  //     apiUrl,
  //     apiToken,
  //     orderNo,
  //     orderItem,
  //   } = this.props;
  //
  //   _deleteFromWorkSplitFromBin(
  //     apiUrl,
  //     apiToken,
  //     orderNo,
  //     orderItem,
  //     packNo,
  //     splitBinID,
  //   );
  // };

  onAddSplitSubmit = () => {
    const {
      splitCountInput,
      splitPackLengthInput,
      addToWorkSplitFromBin: _addToWorkSplitFromBin,
      apiUrl,
      apiToken,
      orderNo,
      orderItem,
      scanPackInput: packNo,
    } = this.props;

    let splitLength;

    if (splitPackLengthInput === 0 || this.binTallies.length === 1) {
      splitLength = this.binTallies.map((e) => ({
        value: e.length,
      }))[0].value;
    } else {
      splitLength = splitPackLengthInput;
    }

    // how to verify 1.1?
    if (!(splitLength >= 0)) {
      displayToast('Invalid length selection');
    } else if (!(Number.isInteger(splitCountInput) && splitCountInput > 0)) {
      displayToast('Split count must be a number');
    } else {
      _addToWorkSplitFromBin(
        apiUrl,
        apiToken,
        orderNo,
        orderItem,
        packNo,
        splitLength,
        splitCountInput,
      );

      if (this.splitCountInputRef.current) {
        this.splitCountInputRef.current.clear();
      }
    }
  };

  onSplitPackLengthDropdownChangeText = (tallyLength) => {
    const {
      updateSplitPackLengthDropdownInput: _updateSplitPackLengthDropdownInput,
    } = this.props;
    _updateSplitPackLengthDropdownInput(tallyLength);
  };

  onSplitSubmit = () => {
    const {
      scanPackInput: packNo,
      splitPackSummary,
      getSplitPackDetails: _getSplitPackDetails,
      apiUrl,
      apiToken,
      orderNo,
      navigation,
      orderItem,
    } = this.props;

    splitPackSummary.forEach((e) => {
      store.dispatch(
        splitPack(
          apiUrl,
          apiToken,
          orderNo,
          orderItem,
          packNo,
          e.length,
          e.quantity,
        ),
      );
    });

    store.dispatch(
      _getSplitPackDetails(apiUrl, apiToken, orderNo, orderItem, packNo),
    );

    store.dispatch(loadOrderItemItems(apiUrl, apiToken, orderNo, orderItem));

    navigation.pop();
  };

  render() {
    const {
      packDetails,
      refreshing,
      scanPackInput: packNo,
      splitPackSummary,
      deleteFromWorkSplitFromBin: _deleteFromWorkSplitFromBin,
      apiUrl,
      apiToken,
      orderNo,
      orderItem,
      splitCountInput,
      navigation,
    } = this.props;

    if (!isEmpty(packDetails)) {
      if (has(packDetails, 'orderPickQty')) {
        // Build lengths from required pick qty
        packDetails.orderPickQty = packDetails.orderPickQty
          .trim()
          .replace(/\s+/g, ' ');
        this.binTallies = packDetails.orderPickQty.split(' ').map((e) => ({
          length: e.split('/')[1] || 0,
          quantity: parseInt(e.split('/')[0], 10),
        }));
      }
      if (has(packDetails, 'availablePieces')) {
        // Build length from first available tally
        packDetails.availablePieces = packDetails.availablePieces
          .trim()
          .replace(/\s+/g, ' ');
        this.binTallies = packDetails.availablePieces.split(' ').map((e) => ({
          length: e.split('/')[1] || 0,
          quantity: parseInt(e.split('/')[0], 10),
        }));
      }
    }

    // Setting the default tally length if when it's available
    // if (binTallies.length > 0 && binTallies[0] !== undefined) {
    //   _updateSplitPackLengthDropdownInput(binTallies.map(e => ({
    //     value: e.length,
    //   }))[0].value);
    // }

    return (
      <View style={styles.container}>
        <Title text="Split Pack" />
        <Card containerStyle={styles.splitPackDetailsContainer}>
          {packDetails.packetNo ? (
            <View>
              <Text>Packet No: {packDetails.packetNo}</Text>
              <Text>Available Qty: {packDetails.availablePieces.trim()}</Text>
              <Text style={{fontWeight: 'bold'}}>
                Required Qty:{' '}
                {packDetails.orderPickQty != null &&
                packDetails.orderPickQty.length === 0
                  ? '0'
                  : packDetails.orderPickQty}
              </Text>
            </View>
          ) : (
            <View>
              <Text>Loading details for {packNo}</Text>
            </View>
          )}
        </Card>
        {this.binTallies.length > 0 && this.binTallies[0] !== undefined ? (
          <Dropdown
            label="Select Length"
            containerStyle={styles.dropDownContainer}
            data={this.binTallies.map((e) => ({
              value: e.length,
            }))}
            value={
              this.binTallies.map((e) => ({
                value: e.length,
              }))[0].value
            }
            onChangeText={this.onSplitPackLengthDropdownChangeText}
          />
        ) : (
          <Dropdown
            label="Select Length"
            containerStyle={styles.dropDownContainer}
            onChangeText={this.onSplitPackLengthDropdownChangeText}
          />
        )}
        <View
          style={{
            borderWidth: 0,
            borderColor: 'yellow',
            flex: 0,
            flexDirection: 'row',
            // marginTop: 10,
            // paddingTop: 0,
            // paddingBottom: 5,
          }}>
          <Input
            containerStyle={styles.splitCountInputStyle}
            inputStyle={{fontSize: 15}}
            ref={this.splitCountInputRef}
            blurOnSubmit={false}
            onChangeText={(text) => {
              this.onSplitCountInputChangeText(text);
            }}
            value={splitCountInput.toString()}
            placeholder="Qty"
            keyboardType="number-pad"
            placeholderTextColor="gray"
          />
          <Button
            buttonStyle={styles.addSplitSubmitButtonStyle}
            // containerStyle={{ verticalAlign: 'middle' }}
            title="Add"
            onPress={this.onAddSplitSubmit}
          />
        </View>
        <ScrollableCard
          data={
            isArray(splitPackSummary)
              ? splitPackSummary.map((e) => ({
                  id: e.splitFromBinId,
                  'Pack#': e.binPacketNo,
                  Pieces: e.totalSplitPieces,
                  Lineal: e.totalLineal,
                  swipeableRightButtons: [
                    [
                      [styles.rightSwipeItem, {backgroundColor: '#FF0000'}],
                      () => {
                        _deleteFromWorkSplitFromBin(
                          apiUrl,
                          apiToken,
                          orderNo,
                          orderItem,
                          packNo,
                          e.splitFromBinId,
                        );
                      },
                      'Unreserve',
                    ],
                  ],
                }))
              : []
          }
          nextScreen=""
          loadListRef={this.loadListRef}
          onRefresh={() => {}}
          refreshing={refreshing}
          navigation={navigation}
          props={this.props}
        />
        <Button
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          title="Split Pack(s)"
          onPress={this.onSplitSubmit}
        />
      </View>
    );
  }
}

OrderPickingOrderItemSplitPackScreen.defaultProps = {
  apiUrl: '',
  apiToken: '',
  packDetails: [],
  scanPackInput: '',
  splitCountInput: 0,
  splitPackLengthInput: 0.0,
  splitPackSummary: [],
  isPicked: false,
  refreshing: false,
};

OrderPickingOrderItemSplitPackScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  updateSplitCountInput: PropTypes.func.isRequired,
  updateSplitPackLengthDropdownInput: PropTypes.func.isRequired,
  addToSplitPackSummary: PropTypes.func.isRequired,
  getSplitPackDetails: PropTypes.func.isRequired,
  getWorkSplitFromBin: PropTypes.func.isRequired,
  addToWorkSplitFromBin: PropTypes.func.isRequired,
  deleteFromWorkSplitFromBin: PropTypes.func.isRequired,
  apiUrl: PropTypes.string,
  apiToken: PropTypes.string,
  packDetails: PropTypes.object,
  isPicked: PropTypes.bool,
  scanPackInput: PropTypes.string,
  splitCountInput: PropTypes.number,
  splitPackLengthInput: PropTypes.number,
  orderNo: PropTypes.number.isRequired,
  orderItem: PropTypes.number.isRequired,
  splitPackSummary: PropTypes.array,
  refreshing: PropTypes.bool,
};

const mapStateToProps = (state, props) => ({
  apiUrl: apiUrlSelector(state),
  apiToken: state.appStore.token,
  scanPackInput: props.route.params.scanPackInput,
  splitPackLengthInput: state.orderPickingStore.splitPackLengthInput,
  orderNo: props.route.params.orderNo,
  orderItem: props.route.params.orderItem,
  splitCountInput: state.orderPickingStore.splitCountInput,
  isPicked: false,
  packDetails: state.orderPickingStore.splitPackDetails,
  splitPackSummary: state.orderPickingStore.splitPackSummary,
  refreshing: state.orderPickingStore.refreshing,
});

const mapDispatchToProps = {
  updateSplitCountInput,
  getSplitPackDetails,
  loadOrderItemItems,
  addToSplitPackSummary,
  splitPack,
  updateSplitPackLengthDropdownInput,
  getWorkSplitFromBin,
  addToWorkSplitFromBin,
  deleteFromWorkSplitFromBin,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OrderPickingOrderItemSplitPackScreen);
