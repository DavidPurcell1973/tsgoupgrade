import React, {useEffect, useRef} from 'react';
import {Button} from 'react-native-elements';
import {Text, FlatList, View} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import styles from './stocktakeStyles';
import {
  loadPacks,
  loadRows,
  updateBranch,
  loadExistingBins,
} from '../../reducers/stocktake/stocktakeReducer';
import Title from '../../components/title/title';
import RowItem from '../../components/stocktake/rowItem';
import {rowsSelector} from '../../selectors/stocktake/stocktakeSelector';
import {
  apiTokenSelector,
  apiUrlSelector,
} from '../../selectors/common/commonSelector';
import logger from '../../helpers/logger';

const StocktakeRowScreen = (props) => {
  const dispatch = useDispatch();
  const rowListRef = useRef();
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const apiToken = useSelector(apiTokenSelector, shallowEqual);
  const rows = useSelector((state) => rowsSelector(state, props));
  const refreshing = useSelector((state) => state.stocktakeStore.refreshing);
  const {
    route: {
      params: {isTestStocktake = false, stocktakeId, description, branchId},
    },
    navigation,
  } = props;

  const apiGetRowsAndPacks = async () => {
    dispatch(updateBranch(branchId));
    if (apiUrl && apiToken) {
      // dispatch(loadRows(apiUrl, apiToken, stocktakeId));
      dispatch(loadPacks(apiUrl, apiToken, stocktakeId));
      dispatch(loadExistingBins(apiUrl, apiToken, stocktakeId));
    } else logger.warn('API URL and token cannot be empty.');
  };

  const rowItemRender = ({item}) => (
    <RowItem item={{...item, isTestStocktake}} />
  );

  useEffect(() => {
    apiGetRowsAndPacks().done();
  }, []);

  return (
    <View style={styles.container}>
      <Title
        text={description ? `Stocktake: ${description}` : 'Unnamed Stocktake'}
        description="To refresh, pull down the list and release"
      />
      <Button
        buttonStyle={styles.shortButtonStyle}
        containerStyle={styles.buttonContainerStyle}
        title="Add New Row"
        onPress={() => {
          navigation.navigate('StocktakeAddRow', props.route.params);
        }}
      />
      {rows.length > 0 ? (
        <FlatList
          ref={rowListRef}
          data={rows}
          onRefresh={() => {
            if (apiUrl && apiToken)
              dispatch(loadRows(apiUrl, apiToken, stocktakeId));
            else logger.warn('API URL and token cannot be empty.');
          }}
          refreshing={refreshing}
          renderItem={rowItemRender}
          keyExtractor={(item) => item.locationId + item.rowName}
        />
      ) : (
        <View
          style={{
            display: 'flex',
            marginTop: 50,
            marginBottom: 50,
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          <Text>No Rows found</Text>
        </View>
      )}
      <Button
        buttonStyle={styles.shortButtonStyle}
        containerStyle={styles.buttonContainerStyle}
        title="Back"
        onPress={() => {
          navigation.pop();
        }}
      />
    </View>
  );
};

export default StocktakeRowScreen;
