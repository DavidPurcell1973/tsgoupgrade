import React, {useEffect, useRef} from 'react';
import {Button} from 'react-native-elements';
import {Text, FlatList, View} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import styles from './stocktakeStyles';
import {
  loadPacks,
  loadLocationsByStocktake,
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
  getUserAppConfigValueSelector
} from '../../selectors/common/commonSelector';
import logger from '../../helpers/logger';
import {displayToast} from '../../helpers/utils';

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

  const simpleStocktakeUser =
    useSelector((state) =>
      getUserAppConfigValueSelector(
        state,
        'Stocktake',
        'simpleStocktakeUser',
      ),
    ) || false;

  const lazyLoadStocktakeMetadata = async () => {
    if (apiUrl && apiToken) {
      logger.info(`Lazy-loading Stocktake ${stocktakeId} details...`);
      displayToast(`Loading Stocktake details...`);

      if (simpleStocktakeUser){
        logger.debug('Simple stocktake app!!');
        dispatch(loadRows(apiUrl, apiToken, stocktakeId));
      }
      else{
        logger.debug('Regular stocktake app!!')
      }
    
      dispatch(loadPacks(apiUrl, apiToken, stocktakeId));
      //dispatch(loadExistingBins(apiUrl, apiToken, stocktakeId));
      //dispatch(loadLocationsByStocktake(apiUrl, apiToken, stocktakeId));
      // dispatch(loadRows(apiUrl, apiToken, s.stocktakeId));
      // dispatch(loadPacks(apiUrl, apiToken, s.stocktakeId));
      // dispatch(loadExistingBins(apiUrl, apiToken, s.stocktakeId));
      // dispatch(loadLocationsByStocktake(apiUrl, apiToken, s.stocktakeId));
    } else logger.warn('API URL and token cannot be empty.');
  };

  const rowItemRender = ({item}) => (
    <RowItem item={{...item, isTestStocktake}} />
  );

  useEffect(() => {
    dispatch(updateBranch(branchId));
    lazyLoadStocktakeMetadata();
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
          // onRefresh={() => {
          //   if (apiUrl && apiToken)
          //     dispatch(loadRows(apiUrl, apiToken, stocktakeId));
          //   else logger.warn('API URL and token cannot be empty.');
          // }}
          // refreshing={refreshing}
          renderItem={rowItemRender}
          keyExtractor={(r) => r.locationId + r.rowName}
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
