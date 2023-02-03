import React, {Component} from 'react';
import {ScrollView, View} from 'react-native';
import {connect} from 'react-redux';
import JSONTree from 'react-native-json-tree';
import PropTypes from 'prop-types';
import styles, {colors} from '../../styles/styles';
import {
  getDrawerIcon,
  getDrawerNavigationOptions,
} from '../../components/drawer/drawerHelpers';
import Title from '../../components/title/title';

const debugDrawerIcon = ({tintColor}) => getDrawerIcon('crosshairs', tintColor);
export const debugNavOptions = getDrawerNavigationOptions(
  'Debug',
  colors.primary,
  'white',
  debugDrawerIcon,
);

class DebugScreen extends Component {
  render() {
    const {
      app,
      smartScan,
      stocktake,
      dynaForm,
      loadPlanning,
      quickScan,
      orderPicking,
      itiConsignmentStocktake,
      quickQuery,
      pod,
    } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView>
          <Title text="App Store" />
          <JSONTree data={app} shouldExpandNode={() => false} />
          <Title text="Consignment Stocktake Store" />
          <JSONTree
            data={itiConsignmentStocktake}
            shouldExpandNode={() => false}
          />
          <Title text="SmartScan Store" />
          <JSONTree data={smartScan} shouldExpandNode={() => false} />
          <Title text="DynamicScan Store" />
          <JSONTree data={dynaForm} shouldExpandNode={() => false} />
          <Title text="QuickScan Store" />
          <JSONTree data={quickScan} shouldExpandNode={() => false} />
          <Title text="Stocktake Store" />
          <JSONTree data={stocktake} shouldExpandNode={() => false} />
          <Title text="Load Picking Store" />
          <JSONTree data={loadPlanning} shouldExpandNode={() => false} />
          <Title text="Order Picking Store" />
          <JSONTree data={orderPicking} shouldExpandNode={() => false} />
          <Title text="Quick Query Store" />
          <JSONTree data={quickQuery} shouldExpandNode={() => false} />
          <Title text="POD Store" />
          <JSONTree data={pod} shouldExpandNode={() => false} />
        </ScrollView>
      </View>
    );
  }
}

DebugScreen.propTypes = {
  app: PropTypes.object,
  smartScan: PropTypes.object,
  dynaForm: PropTypes.object,
  quickScan: PropTypes.object,
  stocktake: PropTypes.object,
  itiConsignmentStocktake: PropTypes.object,
  loadPlanning: PropTypes.object,
  orderPicking: PropTypes.object,
  quickQuery: PropTypes.object,
  pod: PropTypes.object,
};

const mapStateToProps = (state) => ({
  app: state.appStore,
  smartScan: state.smartScanStore,
  dynaForm: state.dynaFormStore,
  quickScan: state.quickScanStore,
  stocktake: state.stocktakeStore,
  itiConsignmentStocktake: state.itiConsignmentStocktakeStore,
  loadPlanning: state.loadPlanningStore,
  pod: state.podStore,
  quickQuery: state.quickQueryStore,
  orderPicking: state.orderPickingStore,
});

export default connect(mapStateToProps)(DebugScreen);
