import React, {useEffect, useMemo, useRef, useReducer, useState} from 'react';
import useHoneywellScanner from '../../hooks/useHoneywellScanner';
import {
  isObject,
  orderBy,
  has,
  isNil,
  isNumber,
  find,
  toBoolean,
  isArray,
  isString,
  isEmpty,
  isBoolean,
  differenceBy,
  compact,
} from 'lodash';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Text, TextInput, FlatList, ScrollView, View} from 'react-native';
import {Button, Input, Overlay} from 'react-native-elements';
import {v4 as uuid} from 'uuid';
import fecha from 'fecha';
import styles from './stocktakeStyles';
import Title from '../../components/title/title';
import {
  apiTokenSelector,
  apiUrlSelector,
} from '../../selectors/common/commonSelector';
import PackListItem from '../../components/itiConsignmentStocktake/packListItem';
import {displayToast} from '../../helpers/utils';
import {
  addPackToRow,
  deletePackFromRow,
} from '../../reducers/stocktake/stocktakeReducer';
import {playGoodSound, playBadSound} from '../../components/common/playSound';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import TwoColumnsDataGrid from '../../components/twoColumnsDataGrid';
import logger from '../../helpers/logger';
import BarcodeBubbleAction from '../../components/BarcodeBubbleAction/BarcodeBubbleAction';
import {displayDialogWithOptions} from '../../helpers/utils';
import AutoComplete from '../../components/AutoComplete/AutoComplete';
import {filterAsync, findAsync} from 'js-coroutines';
import camelcaseKeys from 'camelcase-keys';
import {
  addStubScannedPack,
  clearScannedPacks,
} from '../../reducers/itiConsignmentStocktake/itiConsignmentStocktakeReducer';

const StocktakePackScreen = (props) => {
  const dispatch = useDispatch();
  const inputRef = useRef();
  const packListRef = useRef();
  const userInputRef = useRef();
  const confirmBinInputRef = useRef();
  const [hiddenInput, setHiddenInput] = useState('');
  const [packInput, setPackInput] = useState('');
  const [userPackInput, setUserPackInput] = useState('');
  const [binPack, setBinPack] = useState({});
  const [showScannedPacks, setShowScannedPacks] = useState(true);
  const [binPackActualCount, setBinPackActualCount] = useState(0);
  const [showBinConfirmPiecesOverlay, setShowBinConfirmPiecesOverlay] =
    useState(false);
  const [isUserInputFocus, setIsUserInputFocus] = useState(false);
  const [lastScanBarcode, setLastScanBarcode] = useState('');
  const navigation = useNavigation();
  const {appStore, itiConsignmentStocktakeStore} = useSelector(
    (state) => state,
  );
  const {selectedOperation, scannedPackets, purchaseOrder, serverPackets} =
    itiConsignmentStocktakeStore;
  // const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  // const {username} = appStore;
  // const memoizedPackets = useMemo(() => {
  //   return serverPackets;
  // }, [serverPackets]);

  const packetsForThisOperation = useMemo(() => {
    if (scannedPackets.length > 0) {
      const diffServerPackets = differenceBy(
        camelcaseKeys(serverPackets),
        scannedPackets,
        'packetNo',
      );
      const joinedPackets = [
        scannedPackets[0],
        ...diffServerPackets.map((e) => ({...e, scanned: false})),
        ...scannedPackets.slice(1, scannedPackets.length),
      ];
      return joinedPackets;
    }
    return camelcaseKeys(serverPackets);
  }, [scannedPackets]);

  const PackItemRender = ({item}) => <PackListItem item={item} />;

  useFocusEffect(() => {
    if (!isUserInputFocus && inputRef.current) inputRef.current.focus();
  });

  const handleBarcodeReadSuccess = async (text = '') => {
    //   // Prevent another overlay when there is a processign delay
    if (showBinConfirmPiecesOverlay) {
      return;
    }

    let inputTemp =
      isString(text) && text.length > 0 ? text : hiddenInput || userPackInput;

    // console.log(inputTemp);

    // Reynella Bin = 0
    // inputTemp = 'AL112865';
    // inputTemp = 'DP088X088L336C0';
    // Reynella BIn = 1
    // inputTemp = '480374'

    inputTemp = inputTemp.toString().toLowerCase();

    setLastScanBarcode(inputTemp);
    setHiddenInput('');
    setPackInput('');

    const pack = camelcaseKeys(
      find(serverPackets, (p) => p.PacketNo.toLowerCase() === inputTemp),
    );

    if (showScannedPacks) setShowScannedPacks(false);

    if (!isNil(pack)) {
      const isBin = pack.Bin === '1' || pack.bin === '1';
      // console.log(isBin);

      if (!isBin) {
        dispatch(addStubScannedPack({...pack, scanned: '1'}));
        playGoodSound();
      } else {
        const existingBinPack = camelcaseKeys(
          find(scannedPackets, (p) => p.packetNo.toLowerCase() === inputTemp),
        );

        setBinPack(existingBinPack || pack);
        setShowBinConfirmPiecesOverlay(true);
      }
    } else {
      logger.info(`Pack ${inputTemp} doesn't exists`);
      displayToast(`Pack ${inputTemp} doesn't exists`, 5000);
      playBadSound();
    }
  };

  const handleAddStubBinScannedPack = (close, pack = null) => {
    if (pack) {
      dispatch(addStubScannedPack(pack));
    }
    setShowBinConfirmPiecesOverlay(false);
    setBinPack(null);
  };

  const ScannedPacks = () => {
    return (
      <FlatList
        ref={packListRef}
        data={packetsForThisOperation}
        renderItem={PackItemRender}
        keyExtractor={(item) => item.packetNo.toString()}
      />
    );
  };

  const confirmBinPiecesHeaders = [
    {accessor: 'packetNo', label: 'Packet'},
    {accessor: 'date', label: 'Date'},
    {accessor: 'productCode', label: 'Product'},
    {accessor: 'description', label: 'Description'},
    {accessor: 'dispatch', label: 'Dispatch'},
    {accessor: 'category', label: 'Category'},
    {accessor: 'tag', label: 'Tag'},
    {accessor: 'lineal', label: 'Lineal'},
    {accessor: 'cube', label: 'Cube'},
    {accessor: 'pieces', label: 'Pieces'},
    {accessor: 'pieceCount', label: 'Count'},
    {accessor: 'price', label: 'Price'},
  ];

  return (
    <View style={styles.container}>
      <Title
        text={`Operation: ${selectedOperation.toUpperCase()}`}
        description={`Scanned ${scannedPackets.length || 0} items`}
      />
      <TextInput
        ref={inputRef}
        blurOnSubmit={false}
        style={{height: 0, width: 0, marginTop: -30}}
        value={packInput}
        onChangeText={(text) => {
          setPackInput(text);
        }}
        autoCapitalize="none"
        onTextInput={(e) => {
          setHiddenInput(hiddenInput + e.nativeEvent.text);
          // setHiddenInput(e.nativeEvent.text);
        }}
        onSubmitEditing={() => {
          logger.debug(`Scanned (hidden) barcode: ${hiddenInput}`);
          // console.log(`Scanned (hidden) barcode: ${hiddenInput}`);
          setHiddenInput('');
          // setPackInput('');
          handleBarcodeReadSuccess(hiddenInput);
        }}
      />
      <TextInput
        ref={userInputRef}
        blurOnSubmit={true}
        style={{fontSize: 20, borderBottomWidth: 1}}
        // width={10}
        value={userPackInput}
        onChangeText={(text) => {
          setUserPackInput(text);
        }}
        onBlur={() => {
          setIsUserInputFocus(false);
          if (inputRef.current) inputRef.current.focus();
        }}
        onFocus={() => {
          setIsUserInputFocus(true);
        }}
        autoCapitalize="none"
        placeholder="Enter barcode here"
        placeholderTextColor="gray"
        onSubmitEditing={() => {
          handleBarcodeReadSuccess(userPackInput);
          // setHiddenInput('');
          setUserPackInput('');
        }}
      />
      {!showScannedPacks && (
        <Button
          buttonStyle={styles.shortButtonStyle}
          containerStyle={styles.buttonContainerStyle}
          title={
            showScannedPacks
              ? 'Tap to hide Barcodes'
              : 'Barcodes HIDDEN (Tap to show)'
          }
          onPress={() => {
            setShowScannedPacks(!showScannedPacks);
          }}
        />
      )}
      {showScannedPacks && <ScannedPacks />}
      <View style={{display: 'flex', flex: 1}}></View>
      <Button
        buttonStyle={styles.shortButtonStyle}
        containerStyle={styles.buttonContainerStyle}
        title="Back"
        onPress={() => {
          navigation.pop();
        }}
      />
      <Overlay
        isVisible={showBinConfirmPiecesOverlay && isObject(binPack)}
        onBackdropPress={() => {
          handleAddStubBinScannedPack(false);
        }}
        overlayStyle={styles.overlayContainer}>
        <ScrollView>
          <TwoColumnsDataGrid
            title="Bin Snapshot"
            headers={confirmBinPiecesHeaders}
            hidden={[]}
            data={binPack}
          />
          <Input
            ref={confirmBinInputRef}
            blurOnSubmit={false}
            value={binPackActualCount}
            onChangeText={(text) => {
              let piecesInput = parseInt(text);

              // Set max to system count and 0 as minimum
              if (
                isNumber(parseInt(binPack.pieces)) &&
                piecesInput > binPack.pieces
              ) {
                piecesInput = binPack.pieces;
              }
              if (piecesInput < 0) piecesInput = binPack?.pieceCount || 0;
              setBinPackActualCount(piecesInput);
            }}
            label={'Actual Count'}
            labelStyle={{marginTop: 10, color: 'black'}}
            keyboardType="number-pad"
            placeholder={
              has(binPack, 'pieceCount') ? binPack.pieceCount.toString() : 0
            }
            // labelStyle={styles.labelStyle}
            placeholderTextColor="gray"
            onSubmitEditing={() => {
              const pack = {
                ...binPack,
                scanned: '1',
                pieceCount: binPackActualCount.toString(),
              };
              handleAddStubBinScannedPack(true, pack);
            }}
          />
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Button
              buttonStyle={{width: 100}}
              containerStyle={{
                ...styles.buttonContainerStyle,
                marginLeft: 30,
              }}
              title="Close"
              onPress={() => {
                handleAddStubBinScannedPack(false);
              }}
            />
            <Button
              buttonStyle={{width: 100}}
              containerStyle={{
                ...styles.buttonContainerStyle,
                marginLeft: 30,
              }}
              title="Save"
              onPress={() => {
                const pack = {
                  ...binPack,
                  scanned: '1',
                  pieceCount: binPackActualCount.toString(),
                };
                handleAddStubBinScannedPack(true, pack);
              }}
            />
          </View>
        </ScrollView>
      </Overlay>
    </View>
  );
};

export default StocktakePackScreen;
