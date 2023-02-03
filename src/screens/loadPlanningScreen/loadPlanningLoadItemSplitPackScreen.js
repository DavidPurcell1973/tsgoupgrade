import React, {useMemo, useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Dropdown} from 'react-native-material-dropdown-no-proptypes';
import {Button, Card, Input, Text} from 'react-native-elements';
import {isArray, isEmpty, isNumber, toNumber} from 'lodash';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import styles from './loadPlanningStyles';
import Title from '../../components/title/title';
import {
  getSplitPackDetails,
  getWorkSplitFromBin,
  loadConsignmentItems,
  splitPack,
  addToWorkSplitFromBin,
  deleteFromWorkSplitFromBin,
} from '../../reducers/loadPlanning/loadPlanningReducer';
import store from '../../store/configureStore';
import ScrollableCard from '../../components/scrollableCard/scrollableCard';

import {apiUrlSelector} from '../../selectors/common/commonSelector';
import logger from '../../helpers/logger';
import {displayToast} from '../../helpers/utils';
import {
  getTallyQuantityByLength,
  parseTallyString,
} from '../../helpers/tallyHelper';
import {playBadSound} from '../../components/common/playSound';

const LoadPlanningLoadItemSplitPackScreen = (props) => {
  const dispatch = useDispatch();
  const {appStore, loadPlanningStore} = useSelector((state) => state);
  const {
    token: apiToken,
    username,
    deviceInfo: {androidId, deviceName},
  } = appStore;
  const {
    splitPackDetails: packDetails,
    splitPackSummary,
    refreshing,
  } = loadPlanningStore;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const navigation = useNavigation();
  const [requiredTally, setRequiredTally] = useState([]);
  const [availableTally, setAvailableTally] = useState([]);
  const [splitCountInput, setSplitCountInput] = useState('');
  const [splitPackLengthInput, setSplitPackLengthInput] = useState('');
  const splitCountInputRef = useRef();
  const {route} = props;
  const {
    params: {scanPackInput, consignmentID, loadID, packNo},
  } = route;
  const memoizedPackDetails = useMemo(() => {
    return packDetails;
  }, [packDetails]);

  const clearSplitCountInput = () => {
    if (splitCountInputRef.current) splitCountInputRef.current.clear();
  };
  const refocusSplitCountInput = () => {
    if (splitCountInputRef.current) splitCountInputRef.current.focus();
  };

  const refreshScreen = async () => {
    dispatch(getSplitPackDetails(apiUrl, apiToken, consignmentID, packNo));
    dispatch(getWorkSplitFromBin(apiUrl, apiToken, consignmentID, packNo));
  };

  const onSplitCountInputChangeText = (text) => {
    if (text.length === 0) setSplitCountInput(0);
    else {
      const count = toNumber(text);
      if (isNumber(count) && count > 0) {
        setSplitCountInput(count);
      }
    }
  };

  const onAddSplitSubmit = () => {
    if (!(Number.isInteger(splitCountInput) && splitCountInput > 0)) {
      displayToast('Split count must be a number');
      playBadSound();
      return;
    }

    const availablePieces = getTallyQuantityByLength(
      availableTally,
      splitPackLengthInput,
    );
    logger.debug(
      `Available pieces ${availablePieces} but needed only ${splitCountInput}`,
    );

    if (parseInt(splitCountInput, 10) <= availablePieces) {
      dispatch(
        addToWorkSplitFromBin(
          apiUrl,
          apiToken,
          consignmentID,
          packNo,
          splitPackLengthInput,
          splitCountInput,
        ),
      );
    } else {
      displayToast('You are trying to split more than available?');
    }

    clearSplitCountInput();
    refocusSplitCountInput();
  };

  const onSplitPackLengthDropdownChangeText = (selectedLength) => {
    setSplitPackLengthInput(selectedLength);
  };

  const onSplitSubmit = () => {
    if (splitPackSummary.length > 0) {
      splitPackSummary.forEach((e) => {
        // console.log(e.length);
        // console.log(e.quantity);
        store.dispatch(
          splitPack(
            apiUrl,
            apiToken,
            loadID,
            consignmentID,
            packNo,
            e.length,
            e.quantity,
          ),
        );
      });

      navigation.pop();
    } else {
      displayToast('Add one more split before continue...');
    }

    dispatch(getSplitPackDetails(apiUrl, apiToken, consignmentID, packNo));
    dispatch(loadConsignmentItems(apiUrl, apiToken, consignmentID));
  };

  useFocusEffect(
    useCallback(() => {
      refocusSplitCountInput();
    }, []),
  );

  useEffect(() => {
    refreshScreen().catch();
  }, []);

  useEffect(() => {
    if (!isEmpty(memoizedPackDetails)) {
      const _availableTally = parseTallyString(
        memoizedPackDetails.availablePieces,
      );
      const _requiredTally = parseTallyString(memoizedPackDetails.loadPickQty);
      setAvailableTally(_availableTally);
      setRequiredTally(_requiredTally);
      logger.debug(
        `Parsed available tally: ${JSON.stringify(_availableTally)}`,
      );
      logger.debug(`Parsed required tally: ${JSON.stringify(_requiredTally)}`);
    }
  }, [memoizedPackDetails]);

  useEffect(() => {
    // Set the default tally length if only one is available
    if (isArray(availableTally) && availableTally.length === 1) {
      setSplitPackLengthInput(availableTally[0].length);
    }
  }, [availableTally]);

  useEffect(() => {
    // Set the tally length and quantity if only one Required Tally is available
    if (isArray(requiredTally) && requiredTally.length === 1) {
      const requiredLength = requiredTally[0].length;
      const requiredQuantity = requiredTally[0].quantity;
      const available = requiredTally.filter(
        (e) => e.length === requiredLength,
      );
      let availableQuantity = 0;
      if (available.length > 0) {
        availableQuantity = available[0].quantity;
        setSplitPackLengthInput(requiredLength);
        setSplitCountInput(
          requiredQuantity < availableQuantity
            ? requiredQuantity
            : availableQuantity,
        );
      }
    }
  }, [requiredTally]);

  return (
    <View style={styles.container}>
      <Title text="Split Pack" />
      <Card
        containerStyle={{
          padding: 5,
          marginRight: 2,
          marginLeft: 2,
          marginTop: 5,
          marginBottom: 0,
        }}>
        {memoizedPackDetails.packetNo ? (
          <View>
            <Text>Packet No: {memoizedPackDetails.packetNo}</Text>
            <Text>
              Available Qty: {memoizedPackDetails.availablePieces.trim()}
            </Text>
            <Text style={{fontWeight: 'bold'}}>
              Required Qty:{' '}
              {memoizedPackDetails.loadPickQty.length === 0
                ? '0'
                : memoizedPackDetails.loadPickQty}
            </Text>
          </View>
        ) : (
          <View>
            <Text>Loading pack details {packNo}...</Text>
          </View>
        )}
      </Card>
      {availableTally.length > 0 && (
        <Dropdown
          label="Select Length"
          containerStyle={{
            borderWidth: 0,
            borderColor: 'black',
            paddingLeft: 5,
            paddingRight: 5,
          }}
          data={availableTally.map((e) => ({
            value: e.length,
          }))}
          value={splitPackLengthInput}
          onChangeText={onSplitPackLengthDropdownChangeText}
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
          containerStyle={{
            borderWidth: 0,
            borderColor: 'black',
            width: 200,
            // paddingTop: 15,
            // paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5,
            flex: 1,
            // verticalAlign: 'bottom',
          }}
          inputStyle={{fontSize: 15}}
          ref={splitCountInputRef}
          blurOnSubmit={false}
          onChangeText={(text) => {
            onSplitCountInputChangeText(text);
          }}
          value={splitCountInput.toString()}
          placeholder="Qty"
          keyboardType="number-pad"
          placeholderTextColor="gray"
        />
        <Button
          buttonStyle={{
            width: 70,
            alignSelf: 'stretch',
            marginBottom: 30,
            marginRight: 4,
          }}
          // containerStyle={{ verticalAlign: 'middle' }}
          title="Add"
          onPress={onAddSplitSubmit}
        />
      </View>
      <ScrollableCard
        data={splitPackSummary.map((e) => ({
          id: e.splitFromBinId,
          'Pack#': e.binPacketNo,
          Pieces: e.totalSplitPieces,
          Lineal: e.totalLineal,
          swipeableRightButtons: [
            [
              [styles.rightSwipeItem, {backgroundColor: '#FF0000'}],
              () => {
                dispatch(
                  deleteFromWorkSplitFromBin(
                    apiUrl,
                    apiToken,
                    consignmentID,
                    packNo,
                    e.splitFromBinId,
                  ),
                );
              },
              'Unreserve',
            ],
          ],
        }))}
        onRefresh={() => {}}
        refreshing={refreshing}
        navigation={navigation}
        props={props}
      />
      <Button
        buttonStyle={styles.buttonStyle}
        containerStyle={styles.buttonContainerStyle}
        title="Split Pack(s)"
        onPress={onSplitSubmit}
      />
    </View>
  );
};

export default LoadPlanningLoadItemSplitPackScreen;
