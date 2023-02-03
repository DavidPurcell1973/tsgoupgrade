import React, {useState, useRef, useMemo, useEffect, useCallback} from 'react';
import {View} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Input, Text} from 'react-native-elements';
import styles from './podStyles';
import {getLoads, rehydrateLoads} from '../../reducers/pod/podReducer';
import {
  apiTokenSelector,
  apiUrlSelector,
} from '../../selectors/common/commonSelector';
import ScrollableCard from '../../components/scrollableCard/scrollableCard';
import {displayToast} from '../../helpers/utils';
import {find, uniqBy, isArray, every} from 'lodash';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import logger from '../../helpers/logger';

const PODLoadsScreen = (props) => {
  const dispatch = useDispatch();
  const {appStore, podStore} = useSelector((state) => state);
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const apiToken = useSelector(apiTokenSelector, shallowEqual);
  const {username} = appStore;
  const navigation = useNavigation();
  const {loads, refreshing} = podStore;
  const inputRef = useRef();
  const [userInput, setUserInput] = useState('');
  //   driverName: getDriverName(state, ownProps),

  const carrierName = useMemo(() => {
    if (isArray(loads) && loads.length > 0) {
      return loads[0].contractorName;
    }
    return 'CarrierName';
  }, [loads]);

  const driverName = useMemo(() => {
    if (isArray(loads) && loads.length > 0) {
      return loads[0].driversName;
    }
    return username;
  }, [loads]);

  const memoizedIsSimpleDespatch = useMemo(() => {
    const isSimpleDespatch = every(loads, (e) => {
      return e.loadId === e.despatchId;
    });
    logger.debug(
      `${carrierName} ${driverName} received ${
        isSimpleDespatch ? 'Orders' : 'Loads'
      }...`,
    );
    return isSimpleDespatch;
  }, [loads]);

  const memoizedLoads = useMemo(() => {
    if (isArray(loads) && loads.length > 0) {
      if (memoizedIsSimpleDespatch) {
        return uniqBy(
          loads.map((l) => ({
            // ...l,
            id: l.despatchId,
            'Load#': l.despatchId,
            // 'Assigned to': l.driversName,
            Customers: l.combinedCustomerName.trim(),
            'Delivery Zone': l.deliveryZone,
          })),
          'id',
        );
      }
      return uniqBy(
        loads.map((l) => ({
          id: l.loadId,
          'Load#': l.loadId,
          // 'Assigned to': l.driversName,
          Customers: l.combinedCustomerName.trim(),
          'Delivery Zone': l.deliveryZone,
        })),
        'id',
      );
    } else return [];
  }, [loads]);

  // console.log(podStore);

  useFocusEffect(
    useCallback(() => {
      refocusInput();
    }, []),
  );

  useEffect(() => {
    (async () => {
      await refreshLoadsAsync();
    })();
  }, [apiToken, apiUrl]);

  const refocusInput = () => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const refreshLoadsAsync = async () => {
    if (apiUrl && apiToken) dispatch(getLoads(apiUrl, apiToken));
  };

  const onChangeText = (loadId) => {
    setUserInput(loadId);
  };

  const onSubmit = () => {
    let currentLoad = null;
    if (memoizedIsSimpleDespatch) {
      currentLoad = find(loads, (e) => {
        return (
          e.despatchId.toString().toLowerCase() ===
          userInput.toString().toLowerCase()
        );
      });
    } else {
      currentLoad = find(loads, (e) => {
        return (
          e.loadId.toString().toLowerCase() ===
          userInput.toString().toLowerCase()
        );
      });
    }

    if (currentLoad) {
      if (memoizedIsSimpleDespatch) {
        navigation.navigate(
          'PODDespatchReviewScreen',
          [currentLoad].map((e) => ({
            id: `${e.loadId} ${e.customerName}`,
            despatchId: e.despatchId,
            'Docket#': e.despatchId,
            Priority: e.priority,
            Packs: e.packs,
            Cube: e.cube,
            loadId: e.loadId,
            Customer: e.customerName,
            'Delivery Address':
              e.delivertoAddress1.trim() +
              (e.delivertoAddress2 ? `, ${e.delivertoAddress2.trim()}` : '') +
              (e.delivertoCity ? `, ${e.delivertoCity.trim()}` : '') +
              (e.deliverToPostCode ? ` ${e.deliverToPostCode.trim()}` : ''),
            'Delivery Instructions': e.deliveryNotes,
            'Captured?': e.hasSignature ? 'Yes' : 'No',
            'Sent?': e.isComplete ? 'Yes' : 'No',
          }))[0],
        );
      } else {
        navigation.navigate(
          'PODLoadDespatchesScreen',
          [currentLoad].map((e) => ({
            id: e.loadId,
            ...e,
          }))[0],
        );
      }
    } else {
      displayToast('Unable to find Item ' + userInput);
    }
    setUserInput('');
  };

  return (
    <View style={styles.container}>
      <Text h3 style={styles.textCenter}>
        {carrierName.length > 0 ? carrierName : 'No Loads'}
      </Text>
      <Text h4 style={styles.textCenter}>
        {driverName.length > 0 ? driverName : null}
      </Text>
      <Input
        ref={inputRef}
        blurOnSubmit={false}
        value={userInput}
        onChangeText={(text) => {
          onChangeText(text);
        }}
        placeholder="Enter barcode # here"
        placeholderTextColor="gray"
        onSubmitEditing={() => {
          onSubmit();
        }}
      />
      {
        // Complex Despatch - Load Planning
      }
      {isArray(memoizedLoads) &&
        memoizedLoads.length > 0 &&
        !memoizedIsSimpleDespatch && (
          <ScrollableCard
            data={memoizedLoads.map((e) => ({
              id: e.loadId,
              ...e,
            }))}
            nextScreen={'PODLoadDespatchesScreen'}
            onRefresh={() => {
              refreshLoadsAsync().catch();
            }}
            refreshing={refreshing}
            navigation={navigation}
          />
        )}
      {
        // Simple Despatch
      }
      {isArray(memoizedLoads) &&
        memoizedLoads.length > 0 &&
        memoizedIsSimpleDespatch && (
          <ScrollableCard
            data={loads.map((e) => ({
              id: `${e.loadId} ${e.customerName}`,
              despatchId: e.despatchId,
              'Docket#': e.despatchId,
              Priority: e.priority,
              Packs: e.packs,
              Cube: e.cube,
              loadId: e.loadId,
              Customer: e.customerName,
              'Delivery Address':
                e.delivertoAddress1.trim() +
                (e.delivertoAddress2 ? `, ${e.delivertoAddress2.trim()}` : '') +
                (e.delivertoCity ? `, ${e.delivertoCity.trim()}` : '') +
                (e.deliverToPostCode ? ` ${e.deliverToPostCode.trim()}` : ''),
              'Delivery Instructions': e.deliveryNotes,
              'Captured?': e.hasSignature ? 'Yes' : 'No',
              'Sent?': e.isComplete ? 'Yes' : 'No',
            }))}
            hiddenItem={['despatchId', 'loadId']}
            nextScreen={'PODDespatchReviewScreen'}
            onRefresh={() => {
              refreshLoadsAsync().catch();
            }}
            refreshing={refreshing}
            navigation={navigation}
          />
        )}
    </View>
  );
};

// PODLoadsScreen.defaultProps = {
//   userInput: '',
//   apiUrl: '',
//   apiToken: '',
//   loads: [],
//   carrierName: '',
//   driverName: '',
// };

// PODLoadsScreen.propTypes = {
//   navigation: PropTypes.object.isRequired,
//   apiUrl: PropTypes.string,
//   apiToken: PropTypes.string,
//   getLoads: PropTypes.func.isRequired,
//   rehydrateLoads: PropTypes.func.isRequired,
//   rehydrateCaptures: PropTypes.func.isRequired,
//   loads: PropTypes.array,
//   refreshing: PropTypes.bool,
//   carrierName: PropTypes.string,
//   driverName: PropTypes.string,
// };

// const mapStateToProps = (state, ownProps) => ({
//   apiUrl: apiUrlSelector(state),
//   apiToken: state.appStore.token,
//   loads: getDistinctloads(state, ownProps),
//   refreshing: state.podStore.refreshing,
//   carrierName: getCarrierName(state, ownProps),
//   driverName: getDriverName(state, ownProps),
// });

// const mapDispatchToProps = {
//   getLoads,
//   rehydrateLoads,
//   rehydrateCaptures,
// };

// export default connect(mapStateToProps, mapDispatchToProps)(PODLoadsScreen);
export default PODLoadsScreen;
