import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Button, ScrollView, View} from 'react-native';
import {ButtonGroup, Divider, Input, Text} from 'react-native-elements';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import styles from './loadPlanningStyles';
import Title from '../../components/title/title';
import {apiUrlSelector} from '../../selectors/common/commonSelector';
import {
  loadVerifyPacks,
  postVerifyPack,
  saveUnknownPacks,
  saveVerifyPacks,
} from '../../reducers/loadPlanning/loadPlanningReducer';
import BarcodeBubble from '../../components/BarcodeBubble/BarcodeBubble';
import {playBadSound, playGoodSound} from '../../components/common/playSound';
import logger from '../../helpers/logger';
import {isString} from 'lodash';

const LoadPlanningLoadVerificationScreen = (props) => {
  const {
    route: {params},
  } = props;
  const {load} = params;
  const dispatch = useDispatch();
  const {appStore, loadPlanningStore} = useSelector((state) => state);
  const {
    token: apiToken,
    username,
    deviceInfo: {androidId, deviceName},
  } = appStore;
  const {verifyPacks, unknownPacks} = loadPlanningStore;
  const [barcodeInput, setBarcodeInput] = useState('');
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const navigation = useNavigation();
  const inputRef = useRef();
  const memoizedVerifiedPacks = useMemo(
    () => verifyPacks.filter((e) => e.verified),
    [verifyPacks],
  );
  const memoizedUnverifiedPacks = useMemo(
    () => verifyPacks.filter((e) => !e.verified),
    [verifyPacks],
  );

  const overlayHeaders = [
    {accessor: 'customerName', label: 'Customer'},
    {accessor: 'orderNo', label: 'Order No'},
    {accessor: 'productCode', label: 'Product'},
    {accessor: 'packetNo', label: 'Packet'},
    {accessor: 'loadId', label: 'Load#'},
  ];

  const hiddenFields = ['id', 'verified', 'loadConsignmentId'];

  const refocusLoadInput = () => {
    setTimeout(() => {
      if (inputRef.current !== null) {
        inputRef.current.focus();
      }
    }, 100);
  };

  useFocusEffect(
    useCallback(() => {
      refocusLoadInput();
    }, []),
  );

  useEffect(() => {
    logger.debug(
      `${username} (${deviceName} or ${androidId}) on Load ${load?.id} Verification screen`,
    );
    dispatch(loadVerifyPacks(apiUrl, apiToken, load?.id));
  }, []);

  const validateInput = () => {
    if (isString(barcodeInput) && barcodeInput.trim().length === 0) {
      playBadSound();
      return;
    }
    const unverifiedPacks = memoizedUnverifiedPacks.map((e) =>
      e.packetNo.toLowerCase(),
    );
    const verifiedPacks = memoizedVerifiedPacks.map((e) =>
      e.packetNo.toLowerCase(),
    );
    if (unverifiedPacks.includes(barcodeInput.trim().toLowerCase())) {
      const pack = verifyPacks.filter(
        (e) => e.packetNo.toLowerCase() === barcodeInput.trim().toLowerCase(),
      );
      if (
        pack.length > 0 &&
        pack[0].loadConsignmentId !== undefined &&
        pack[0].packetNo !== undefined &&
        pack[0].loadConsignmentId > 0 &&
        pack[0].packetNo.length > 0
      ) {
        pack[0].verified = true;
        dispatch(
          postVerifyPack(
            apiUrl,
            apiToken,
            pack[0].loadId,
            pack[0].loadConsignmentId,
            pack[0].packetNo,
          ),
        );
        dispatch(saveVerifyPacks([...verifyPacks]));
      }
      playGoodSound();
    } else if (verifiedPacks.includes(barcodeInput.trim().toLowerCase())) {
      playGoodSound();
      //  Do nothing
    } else {
      playBadSound();
      dispatch(
        saveUnknownPacks([
          ...unknownPacks.concat({packetNo: barcodeInput.trim()}),
        ]),
      );
    }

    setBarcodeInput('');
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 0,
          flexDirection: 'row',
        }}>
        <Title text={`Load ${load?.id} - Verify Packs`} />
        <View
          style={{
            flex: 1,
            margin: 10,
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
          }}>
          <Text style={{fontSize: 15}}>
            {memoizedVerifiedPacks.length}/{verifyPacks.length}
          </Text>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          // borderWidth: 1,
          // borderColor: 'red',
        }}>
        <Input
          ref={inputRef}
          blurOnSubmit={false}
          value={barcodeInput}
          onChangeText={(text) => {
            setBarcodeInput(text);
          }}
          placeholder="Scan barcode here"
          containerStyle={styles.inputContainerStyle}
          placeholderTextColor="gray"
          onSubmitEditing={() => {
            validateInput();
          }}
        />
        {unknownPacks.length > 0 && (
          <>
            <Title text="Unknown" />
            <View style={{minHeight: 50, maxHeight: '20%'}}>
              <ScrollView>
                <View
                  style={{
                    flex: 0,
                    flexDirection: 'row',
                    // borderWidth: 1,
                    // borderColor: 'blue',
                    flexWrap: 'wrap',
                  }}>
                  {unknownPacks.map((e) => (
                    <BarcodeBubble
                      key={e.packetNo}
                      item={e}
                      id="packetNo"
                      overlayHeaders={overlayHeaders}
                      hiddenFields={hiddenFields}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          </>
        )}
        {memoizedUnverifiedPacks.length > 0 && (
          <>
            <Title text="Unverified" />
            <View style={{minHeight: 50, maxHeight: '20%'}}>
              <ScrollView>
                <View
                  style={{
                    flex: 0,
                    flexDirection: 'row',
                    // borderWidth: 1,
                    // borderColor: 'blue',
                    flexWrap: 'wrap',
                  }}>
                  {memoizedUnverifiedPacks.map((e) => (
                    <BarcodeBubble
                      key={e.packetNo}
                      item={e}
                      id="packetNo"
                      overlayHeaders={overlayHeaders}
                      hiddenFields={hiddenFields}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          </>
        )}
        <Title text="Verified" />
        <View style={{minHeight: 50, maxHeight: '30%'}}>
          <ScrollView>
            <View
              style={{
                flex: 0,
                flexDirection: 'row',
                // borderWidth: 1,
                // borderColor: 'blue',
                flexWrap: 'wrap',
              }}>
              {memoizedVerifiedPacks.map((e) => (
                <BarcodeBubble
                  key={e.packetNo}
                  item={e}
                  id="packetNo"
                  overlayHeaders={overlayHeaders}
                  hiddenFields={hiddenFields}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
      <View>
        <Button
          buttonStyle={styles.wideButtonStyle}
          containerStyle={styles.buttonContainerStyle}
          title="Back"
          onPress={() => {
            navigation.pop();
          }}
        />
      </View>
    </View>
  );
};

export default LoadPlanningLoadVerificationScreen;
