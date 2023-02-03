import React, {useEffect, useRef, useState} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {Text, FlatList, View} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Button} from 'react-native-elements';
import {
  loadStocktakes,
  loadOptions,
  loadLocations,
  loadProducts,
  clearRowByStocktakeId,
  clearPacksByStocktakeId,
  loadPacks,
  loadLocationsByStocktake,
  loadRows,
  loadExistingBins,
} from '../../reducers/stocktake/stocktakeReducer';
import styles from './stocktakeStyles';
import InternalTitle from '../../components/title/title';
import StocktakeItem from '../../components/stocktake/stocktakeItem';
import {
  apiTokenSelector,
  apiUrlSelector,
  getUserAppConfigValueSelector
} from '../../selectors/common/commonSelector';
import logger from '../../helpers/logger';
import {isArray} from 'lodash';
import {displayDialogWithOptions} from '../../helpers/utils';

const StocktakeListScreen = (props) => {
  const dispatch = useDispatch();
  const {stocktakeStore} = useSelector((state) => state);
  const [isRefreshingOfflineCache, setIsRefreshingOfflineCache] =
    useState(false);
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const {stocktakes, rowPacks, locations} = stocktakeStore;
  const refreshing = useSelector((state) => state.stocktakeStore.refreshing);
  const apiToken = useSelector(apiTokenSelector, shallowEqual);
  const hasPendingChanges = rowPacks.length > 0;
  const activeStocktakeId = hasPendingChanges ? rowPacks[0].stocktakeId : 0;
  const simpleStocktakeUser =
    useSelector((state) =>
      getUserAppConfigValueSelector(
        state,
        'Stocktake',
        'simpleStocktakeUser',
      ),
    ) || false;

  const handleClearAll = async () => {

    displayDialogWithOptions(
      'Clear Queue?',
      'Are you sure you want to clear queue (including all pending/unsent/error items)?',
      {
        success: () => {
          rowPacks.forEach((s) => {
            dispatch(clearRowByStocktakeId(s.stocktakeId));
            dispatch(clearPacksByStocktakeId(s.stocktakeId));
          });
        },
        negative: () => {},
        dismiss: () => {},
        buttons: {
          positiveText: 'Confirm',
          negativeText: 'Cancel',
        },
      },
    );
  };

  const refreshOfflineCache = async () => {
    logger.debug('URL: ' + apiUrl);
    logger.debug('Token: ' + apiToken);
    logger.debug('Token: ' + isRefreshingOfflineCache);
    if (apiUrl && apiToken && !isRefreshingOfflineCache) {
      setIsRefreshingOfflineCache(true);
      dispatch(loadOptions(apiUrl, apiToken));
      dispatch(loadStocktakes(apiUrl, apiToken));
      dispatch(loadLocations(apiUrl, apiToken));
      dispatch(loadProducts(apiUrl, apiToken, 0));
    } else logger.warn('API URL and token cannot be empty.');
  };

  // useEffect(() => {
  //   if (
  //     isArray(stocktakes) &&
  //     stocktakes.length > 0 &&
  //     isRefreshingOfflineCache &&
  //     apiUrl &&
  //     apiToken
  //   ) {
  //     logger.debug(
  //       `Found ${stocktakes.length} stocktakes. Querying data for each Stocktake starts...`,
  //     );
  //     stocktakes.forEach((s) => {
  //       dispatch(loadRows(apiUrl, apiToken, s.stocktakeId));
  //       dispatch(loadPacks(apiUrl, apiToken, s.stocktakeId));
  //       dispatch(loadExistingBins(apiUrl, apiToken, s.stocktakeId));
  //       dispatch(loadLocationsByStocktake(apiUrl, apiToken, s.stocktakeId));
  //     });
  //     setIsRefreshingOfflineCache(false);
  //     logger.debug(`Querying data for each Stocktake ends...`);
  //   }
  // }, [stocktakes]);

  const renderItem = ({item}) => (
    <StocktakeItem item={{...item, hasPendingChanges, activeStocktakeId}} />
  );

  // useEffect(() => {
  //   // if (!isArray(rowPacks)) dispatch();
  //   // if (!isArray(packs)) dispatch();
  //   // if (!isArray(rows)) dispatch();
  //   // dispatch(clearRowByStocktakeId(1152));
  //   // dispatch(clearPacksByStocktakeId(1152));
  //   apiGetStocktakes();
  // }, []);

  return (
    <View style={styles.container}>
      <View style={styles.taskContainer}>
        <InternalTitle
          text="Stocktake"
          description="This is a OFFLINE Stocktake. Changes will be stored locally. Swipe from the right to Export. To refresh, pull down the list and release"
        />
        <View style={{display: 'flex', flex: 1}}></View>
        <Button
          buttonStyle={styles.shortButtonStyle}
          containerStyle={styles.buttonContainerStyle}
          title="Refresh Offline Cache"
          onPress={() => {
            refreshOfflineCache();
          }}
        />
        {((rowPacks.length > 0) && !simpleStocktakeUser) &&(
          <Button
            icon={
              <Icon
                name="undo"
                style={{marginRight: 10}}
                size={15}
                color="white"
              />
            }
            // iconContainerStyle={{marginRight: 20, paddingRight: 20}}
            buttonStyle={styles.shortButtonStyle}
            containerStyle={styles.buttonContainerStyle}
            title="Clear All Pending Actions"
            onPress={() => handleClearAll()}
          />
        )}
        {stocktakes.length > 0 ? (
          <FlatList
            data={stocktakes}
            refreshing={refreshing}
            renderItem={renderItem}
            keyExtractor={(item) => item.stocktakeId.toString()}
          />
        ) : (
          <View
            style={{
              display: 'flex',
              marginTop: 50,
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <Text>No Stocktakes found</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default StocktakeListScreen;
