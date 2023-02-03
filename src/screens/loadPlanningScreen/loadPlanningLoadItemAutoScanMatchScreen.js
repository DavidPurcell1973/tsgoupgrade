import React, {Component} from 'react';
import {AsyncStorage, View} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import styles from './loadPlanningStyles';
import Title from '../../components/title/title';
import {
  loadLoadItems,
  updateLoadInput,
} from '../../reducers/loadPlanning/loadPlanningReducer';
import ScrollableCard from '../../components/scrollableCard/scrollableCard';
import ScrollableCardItem from '../../components/scrollableCard/scrollableCardItem';

class LoadPlanningLoadItemAutoScanMatchScreen extends Component {
  constructor(props) {
    super(props);
    const {navigation} = this.props;
    this.navigation = navigation;
    this.bootstrapAsync();
  }

  bootstrapAsync = async () => {
    const {
      // loadOfflineLoadItems: _loadOfflineLoadItems,
      loadLoadItems: _loadLoadItems,
      apiToken,
      apiUrl,
    } = this.props;
    const loadItem = this.navigation.state.params.item;

    _loadLoadItems({apiUrl, apiToken, loadID: loadItem.id});

    const loadItems = await AsyncStorage.getItem('LoadPlanningLoadItems');
    const offlineLoadItemsLastUpdate = await AsyncStorage.getItem(
      'OfflineLoadItemsLastUpdate',
    );

    // _loadOfflineLoadItems(
    //   loadItems ? JSON.parse(loadItems) : {},
    //   offlineLoadItemsLastUpdate
    //     ? JSON.parse(offlineLoadItemsLastUpdate)
    //     : new Date(),
    // );
  };

  render() {
    const {loadItems, navigation} = this.props;
    return (
      <View style={styles.container}>
        <Title text="Load Items" description="Pick a load item" />
        <ScrollableCard
          data={loadItems.map((e) => ({
            id: e.LoadConsignmentID,
            Picked: e.PacksPicked,
            'To Pick': e.Packs,
            Customer: e.CustomerName,
            'Order No': e.OrderNo,
            'Order Item': e.OrderItem,
            'Weight Picked': e.WeightPicked,
            'Cube Picked': e.CubePicked,
            Notes: e.Notes,
            'Despatch Notes': e.DespatchNotes,
            'Internal Notes': e.InternalNotes,
            Reserved: e.Reserved,
          }))}
          nextScreen="LoadPlanningLoadItem"
          navigation={navigation}
          props={this.props}
        />
      </View>
    );
  }
}

LoadPlanningLoadItemAutoScanMatchScreen.defaultProps = {
  loadItems: [],
  apiUrl: '',
  apiToken: '',
};

LoadPlanningLoadItemAutoScanMatchScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  loadLoadItems: PropTypes.func.isRequired,
  loadOfflineLoadItems: PropTypes.func.isRequired,
  loadItems: PropTypes.array,
  apiUrl: PropTypes.string,
  apiToken: PropTypes.string,
};

const mapStateToProps = (store, props) => ({
  loadItems: store.loadPlanningStore.loadItems,
  apiUrl: store.appStore.apiUrl,
  apiToken: store.appStore.token,
});

const mapDispatchToProps = {
  updateLoadInput,
  loadLoadItems,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LoadPlanningLoadItemAutoScanMatchScreen);
