import React, {Component} from 'react';
import {Button, View} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {ButtonGroup, Text} from 'react-native-elements';
import styles from './loadPlanningStyles';
import Title from '../../components/title/title';
import {
  loadConsignmentPacks,
  loadConsignmentReservedPacks,
  updatePackListOptionsInput,
} from '../../reducers/loadPlanning/loadPlanningReducer';
import ScrollableCard from '../../components/scrollableCard/scrollableCard';
import {apiUrlSelector} from '../../selectors/common/commonSelector';

class LoadPlanningLoadItemPackListScreen extends Component {
  constructor(props) {
    super(props);
    const {navigation} = this.props;
    this.navigation = navigation;
    this.loadConsignmentPacksAsync().done();
  }

  availablePacks = () => <Text>Available</Text>;

  reservedPacks = () => <Text>Reserved</Text>;

  loadConsignmentPacksAsync = async () => {
    const {
      apiToken,
      apiUrl,
      loadConsignmentPacks: _loadConsignmentPacks,
      loadConsignmentReservedPacks: _loadConsignmentReservedPacks,
      consignmentID,
    } = this.props;

    _loadConsignmentPacks(apiUrl, apiToken, consignmentID);
    _loadConsignmentReservedPacks(apiUrl, apiToken, consignmentID);
  };

  render() {
    const {
      updatePackListOptionsInput: _updatePackListOptionsInput,
      packListOptionsInput,
      consignmentPacks,
      consignmentReservedPacks,
      consignmentID,
      apiToken,
      apiUrl,
      loadConsignmentPacks: _loadConsignmentPacks,
      loadConsignmentReservedPacks: _loadConsignmentReservedPacks,
    } = this.props;

    const buttons = [
      {element: this.availablePacks},
      {element: this.reservedPacks},
    ];

    return (
      <View style={styles.container}>
        <Title text={`Pack List for Consignment ${consignmentID}`} />
        <ButtonGroup
          onPress={(selectedIndex) => {
            _updatePackListOptionsInput(selectedIndex);
            if (selectedIndex === 0)
              _loadConsignmentPacks(apiUrl, apiToken, consignmentID).catch();
            else
              _loadConsignmentReservedPacks(
                apiUrl,
                apiToken,
                consignmentID,
              ).catch();
          }}
          selectedIndex={packListOptionsInput}
          buttons={buttons}
          // containerStyle={{ height: 100 }}
        />
        <View style={{flex: 1}}>
          {packListOptionsInput === 0 && consignmentPacks.length > 0 ? (
            <ScrollableCard
              data={consignmentPacks.map((e) => ({
                id: e.packetNo,
                'Pack#': e.packetNo,
                Product: e.productCode,
                Pieces: e.pieces,
                Lineal: e.lineal,
                Cube: e.cube,
                Location: e.lastLocation,
                // 'Order#': e.orderNo,
                // 'Order Item': e.orderItem,
              }))}
              loadListRef={this.loadListRef}
              navigation={this.navigation}
              props={this.props}
            />
          ) : packListOptionsInput === 1 &&
            consignmentReservedPacks.length > 0 ? (
            <ScrollableCard
              data={consignmentReservedPacks.map((e) => ({
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
              // onRefresh={() => {
              //   store.dispatch(_loadConsignmentItems(apiUrl, apiToken, consignmentID));
              // }}
              // refreshing={refreshing}
              navigation={this.navigation}
              props={this.props}
            />
          ) : (
            <Text>No packs found</Text>
          )}
        </View>
        <Button
          buttonStyle={styles.wideButtonStyle}
          containerStyle={styles.buttonContainerStyle}
          title="Back"
          onPress={() => {
            this.navigation.pop();
          }}
        />
      </View>
    );
  }
}

LoadPlanningLoadItemPackListScreen.defaultProps = {
  consignmentReservedPacks: [],
  consignmentPacks: [],
};

LoadPlanningLoadItemPackListScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  apiUrl: PropTypes.string.isRequired,
  apiToken: PropTypes.string.isRequired,
  updatePackListOptionsInput: PropTypes.func.isRequired,
  loadConsignmentPacks: PropTypes.func.isRequired,
  loadConsignmentReservedPacks: PropTypes.func.isRequired,
  packListOptionsInput: PropTypes.number.isRequired,
  consignmentPacks: PropTypes.array,
  consignmentReservedPacks: PropTypes.array,
  consignmentID: PropTypes.number.isRequired,
};

const mapStateToProps = (state, props) => ({
  apiUrl: apiUrlSelector(state),
  apiToken: state.appStore.token,
  packListOptionsInput: state.loadPlanningStore.packListOptionsInput,
  consignmentPacks:
    state.loadPlanningStore.consignmentPacks[props.route.params.consignmentID],
  consignmentReservedPacks:
    state.loadPlanningStore.consignmentReservedPacks[
      props.route.params.consignmentID
    ],
  consignmentID: props.route.params.consignmentID,
});

const mapDispatchToProps = {
  updatePackListOptionsInput,
  loadConsignmentPacks,
  loadConsignmentReservedPacks,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LoadPlanningLoadItemPackListScreen);
