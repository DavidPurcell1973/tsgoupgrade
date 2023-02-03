import React, {useEffect, useMemo, useRef, useReducer, useState} from 'react';
import useHoneywellScanner from '../../hooks/useHoneywellScanner';
import {
  has,
  isObject,
  orderBy,
  isNil,
  isNumber,
  isArray,
  isString,
  isEmpty,
  find,
} from 'lodash';
import {Text, TextInput, FlatList, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Input, Overlay} from 'react-native-elements';
import 'react-native-get-random-values';
import {v4 as uuid} from 'uuid';
import fecha from 'fecha';
import styles from './stocktakeStyles';
import Title from '../../components/title/title';
import PackListItem from '../../components/stocktake/packListItem';
import {displayToast} from '../../helpers/utils';
import {
  addPackToRow,
  deletePackFromRow,
} from '../../reducers/stocktake/stocktakeReducer';
import {playGoodSound, playBadSound} from '../../components/common/playSound';
import {useFocusEffect} from '@react-navigation/native';
import TwoColumnsDataGrid from '../../components/twoColumnsDataGrid';
import logger from '../../helpers/logger';
import BarcodeBubbleAction from '../../components/BarcodeBubbleAction/BarcodeBubbleAction';
import {displayDialogWithOptions} from '../../helpers/utils';
import AutoComplete from '../../components/AutoComplete/AutoComplete';
import {filterAsync, findAsync} from 'js-coroutines';

const StocktakePackScreen = (props) => {
  const dispatch = useDispatch();
  const inputRef = useRef();
  const packListRef = useRef();
  const userInputRef = useRef();
  const newPackLengthInputRef = useRef();
  const newPackPiecesInputRef = useRef();
  const confirmBinInputRef = useRef();
  const [hiddenInput, setHiddenInput] = useState('');
  const [packInput, setPackInput] = useState('');
  const [userPackInput, setUserPackInput] = useState('');
  const [binPack, setBinPack] = useState({});
  const [showPacks, setShowPacks] = useState(true);
  const [confirmBinPackActualCount, setConfirmBinPackActualCount] = useState(0);
  const [showConfirmBinOverlay, setShowConfirmBinOverlay] = useState(false);
  const [isUserInputFocus, setIsUserInputFocus] = useState(false);
  const [showAddFoundPackOverlay, setShowAddFoundPackOverlay] = useState(false);
  const [lastScanBarcode, setLastScanBarcode] = useState('');
  const [newPack, setNewPack] = useState({});
  const [newPackInput, setNewPackInput] = useState({});
  const [newPackInputErrors, setNewPackErrors] = useState({});
  // const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const currentUser = useSelector((state) => state.appStore.username);
  const stocktakeStore = useSelector((state) => state.stocktakeStore);
  const {options, packs, existingBins, products, rowPacks} = stocktakeStore;
  const {allowCreateFoundPack = false, binIdentifier = 'packno'} = options;
  const {
    isTestStocktake = false,
    stocktakeId,
    locationId,
    rowName,
  } = props.route.params;
  const memoizedPacks = useMemo(() => {
    return packs.filter((pack) => pack.stocktakeId === stocktakeId);
  }, []);
  const memoizedProducts = useMemo(() => {
    return products;
  }, [products]);

  const memoizedProductLabels = useMemo(() => {
    return orderBy(
      memoizedProducts.map((e) => ({
        label: `${e.productCode}: ${e.productDescription}`,
        value: e.productCode,
      })),
      'label',
    );
  }, [memoizedProducts]);

  const [productSelection, setProductSelection] = useState(
    ''//memoizedProducts[0].value || '',
  );
  const memoizedShowTallyField = useMemo(() => {
    const product = memoizedProducts.filter(
      (e) => e.productCode.toLowerCase() === productSelection.toLowerCase(),
    );
    if (product.length > 0) {
      return !product[0].isFixedLength;
    }
    return true;
  }, [productSelection]);

  const memoizedPacksInRow = useMemo(() => {
    return rowPacks.filter(
      (pack) =>
        pack.stocktakeId === stocktakeId &&
        pack.locationId === locationId &&
        pack.rowName === rowName,
    );
  }, [rowPacks]);

  const delayShowPacksTimeout = 5000;

  const {
    route: {
      params: {type, preCount},
    },
    navigation,
  } = props;

  useEffect(() => {
    logger.info(`Working on Stocktake ID ${stocktakeId}`);
    logger.info(
      `[Stocktake ${stocktakeId}] Packs found: ${memoizedPacks.length}`,
    );
    logger.info(
      `[Stocktake ${stocktakeId}] Products found: ${memoizedProducts.length}`,
    );
  }, [memoizedPacks, memoizedProducts]);

  // useEffect(
  //   () => {
  //     const delayShowPacks = setTimeout(() => {
  //       setShowPacks(true);
  //       // clearTimeout(delayShowPacks);
  //     }, delayShowPacksTimeout);

  //     // this will clear Timeout
  //     // when component unmount like in willComponentUnmount
  //     // and show will not change to true
  //     return () => {
  //       clearTimeout(delayShowPacks);
  //     };
  //   },
  //   // useEffect will run only one time with empty []
  //   // if you pass a value to array,
  //   // like this - [data]
  //   // than clearTimeout will run every time
  //   // this value changes (useEffect re-run)
  //   [],
  // );

  // useEffect(() => {
  //   if (showAddFoundPackOverlay) {
  //     setTimeout(() => setShowAddFoundPackOverlay(false), 1000);
  //   }
  // }, [showAddFoundPackOverlay]);

  const PackItemRender = ({item}) => <PackListItem item={item} />;

  useFocusEffect(() => {
    if (!isUserInputFocus && inputRef.current) inputRef.current.focus();
  });

  const handleBarcodeReadSuccess = async (text = '') => {
    // Prevent another overlay when there is a processign delay
    if (showAddFoundPackOverlay) {
      return;
    }

    const inputTemp =
      isString(text) && text.length > 0 ? text : hiddenInput || userPackInput;

    setLastScanBarcode(inputTemp);
    setHiddenInput('');
    setPackInput('');
    setProductSelection('');
    logger.debug(`Scanned Barcode ${inputTemp} Row: ${rowName}`, {
      stocktakeId,
      rowName,
      baarcode: inputTemp,
    });

    // console.log(`before find ${new Date().toLocaleString()}`);
    // const packFoundInAllPacks = !isNil(
    //   await findAsync(
    //     memoizedPacks,
    //     (e) => e.packNo.toLowerCase() === inputTemp.toLowerCase(),
    //   ),
    // );
    const packFoundInAllPacks = !isNil(
      find(
        memoizedPacks,
        (e) => e.packNo.toLowerCase() === inputTemp.toLowerCase(),
      ),
    );

    if (
      honeywellScanner &&
      honeywellScanner.isCompatible &&
      honeywellScanner.isClaimed
    ) {
      displayToast(text);
    }

    if (showPacks) setShowPacks(false);

    switch (type) {
      case 'bin':
        if (confirmBinPackActualCount > 0) {
          await saveBinPack(binPack.packNo);
          setShowConfirmBinOverlay(false);
          setConfirmBinPackActualCount(0);
        } else {
          let binPack = {};

          if (isArray(existingBins) && existingBins.length >= 0) {
            if (
              binIdentifier.toLowerCase() === 'gtin' &&
              !isNil(existingBins[0].gtin)
            ) {
              binPack = await find(
                existingBins,
                (e) =>
                  has(e, 'gtin') &&
                  isString(e.gtin) &&
                  //!isNil(e.gtin) &&
                  e.gtin.toString().toLowerCase() === inputTemp.toLowerCase(),
              );
            } else if (
              binIdentifier.toLowerCase() === 'packno' &&
              !isNil(existingBins[0].packetNo)
            ) {
              binPack = await find(
                existingBins,
                (e) => e.packetNo.toLowerCase() === inputTemp.toLowerCase(),
              );
            } else {
              const errorMessage =
                'Unknown Bin identifier type or invalid barcode scanned';
              displayToast(errorMessage);
              logger.error(errorMessage);
              playBadSound();
            }
          }

          if (!binPack) {
            logger.info(`Bin Pack ${inputTemp} doesn't exists`);
            displayToast(`Bin Pack ${inputTemp} doesn't exists`, 5000);
            playBadSound();
            break;
          }

          const foundProduct = await find(
            products,
            (e) => e.productId === binPack.productId,
          );

          if (!foundProduct) {
            logger.info(`Product ${binPack.productId} doesn't exists`);
            displayToast(`Product ${binPack.productId} doesn't exists`, 5000);
            playBadSound();
            break;
          }

          const isPackAlreadyExists = await find(
            rowPacks,
            (pack) =>
              pack.stocktakeId === props.route.params.stocktakeId &&
              pack.packNo.toLowerCase() === inputTemp.toLowerCase(),
          );

          prepareShowConfirmBinOverlay({
            packNo: inputTemp,
            product: foundProduct.productCode,
            gtin: binPack.gtin,
            systemCount: binPack.systemCount,
            actualCount: isPackAlreadyExists
              ? isPackAlreadyExists.actualCount
              : 0,
          });
          setShowConfirmBinOverlay(true);

          setTimeout(() => {
            if (confirmBinInputRef.current) confirmBinInputRef.current.focus();

            if (isPackAlreadyExists) {
              // Pop up a warning if pieces count already exists
              // Prompt here so that it appears above the overlay
              playBadSound();
              displayDialogWithOptions(
                'Pieces already counted!',
                'Are you sure you want to continue?',
                {
                  success: () => {},
                  negative: () => {
                    setShowConfirmBinOverlay(false);
                    setConfirmBinPackActualCount(0);
                  },
                  dismiss: () => {},
                  buttons: {
                    positiveText: 'OK',
                    negativeText: 'Cancel',
                  },
                },
              );
            }
          }, 500);
        }
        break;
      case 'pack':
        // Pack is not found & skip if it's a test stocktake
        if (!isTestStocktake && !packFoundInAllPacks) {
          if (allowCreateFoundPack) {
            playBadSound();
            if (lastScanBarcode === inputTemp) {
              setShowAddFoundPackOverlay(true);
              setNewPack({packetNo: inputTemp});
            } else {
              displayToast(
                'Pack not found! Scan Pack AGAIN to create pack',
                3000,
              );
              logger.debug(
                `Scan the pack AGAIN to create pack - Last: ${lastScanBarcode} vs Now: ${inputTemp}`,
              );
            }
          } else await saveFoundPack(inputTemp);
        } else await saveFoundPack(inputTemp);
        break;
      default:
        logger.debug('Hit default');
        setConfirmBinPackActualCount(0);
        break;
    }

    // forceUpdate();
    // delayShowPacks();
  };

  const honeywellScanner = useHoneywellScanner({
    onBarcodeReadSuccess: handleBarcodeReadSuccess,
    screen: 'StocktakeScanPack',
  });

  const prepareShowConfirmBinOverlay = ({
    packNo,
    product,
    systemCount,
    actualCount,
    gtin,
  }) => {
    setBinPack({
      packNo,
      product,
      systemCount,
      actualCount,
      gtin,
    });
  };

  const saveBinPack = async (packNo) => {
    if (packNo.length !== 0) {
      const data = {
        uuid: uuid(),
        stocktakeId: props.route.params.stocktakeId,
        rowName: props.route.params.rowName,
        locationId: props.route.params.locationId,
        packNo: packNo,
        match: true,
        product: binPack.product,
        gtin: binPack.gtin,
        known: true,
        type: 'bin',
        systemCount: 2,
        actualCount: confirmBinPackActualCount,
        scannedOn: fecha.format(new Date(), 'YYYY-MM-DD hh:mm:ss'),
        scannedBy: currentUser,
      };
      const isPackAlreadyExists = !isNil(
        await find(
          rowPacks,
          (pack) =>
            pack.stocktakeId === props.route.params.stocktakeId &&
            pack.packNo.toLowerCase() === binPack.packNo.toLowerCase(),
        ),
      );
      if (isPackAlreadyExists)
        dispatch(deletePackFromRow({uuid: isPackAlreadyExists.uuid}));
      dispatch(addPackToRow(data));
      playGoodSound();
    } else {
      displayToast('Invalid pack entered');
      logger.warn(`Invalid pack ${packNo} entered`);
      playBadSound();
    }
  };

  const saveFoundPack = async (packNo) => {
    const isDuplicatePack = !isEmpty(
      await find(
        memoizedPacksInRow,
        (e) => e.packNo.toLowerCase() === packNo.toLowerCase(),
      ),
    );

    if (isDuplicatePack) {
      displayToast(`Duplicate barcode? ${packNo}`, 10000);
      logger.warn(`Duplicate barcode? ${packNo}`);
      playBadSound();
      return;
    }

    if (packNo.length !== 0) {
      const data = {
        uuid: uuid(),
        stocktakeId: stocktakeId,
        rowName: props.route.params.rowName,
        locationId: locationId,
        packNo: isTestStocktake
          ? packNo + Math.floor(Math.random() * 1000 + 1)
          : packNo,
        // match: false,
        // product: '',
        // known: false,
        type: 'pack',
        scannedOn: fecha.format(new Date(), 'YYYY-MM-DD hh:mm:ss'),
        scannedBy: currentUser,
      };

      // console.log(`start pack find 2 ${new Date().toLocaleString()}`);
      const packFoundInAllPacks = await find(
        memoizedPacks,
        (p) =>
          p.stocktakeId === stocktakeId &&
          p.packNo.toLowerCase() === packNo.toLowerCase(),
      );
      // console.log(`end pack find 2 ${new Date().toLocaleString()}`);

      /* eslint no-param-reassign: "error" */
      data.known = isObject(packFoundInAllPacks);
      data.product = isObject(packFoundInAllPacks)
        ? packFoundInAllPacks.product
        : 'n/a';
      data.match = isObject(packFoundInAllPacks);
      dispatch(addPackToRow(data));
      // Play sound only if honeywell scanner is not present
      if (!honeywellScanner.isClaimed) playGoodSound();
    } else {
      displayToast('Invalid pack entered');
      playBadSound();
    }
  };

  const saveFoundPackWithTallies = async (pack) => {
    const isDuplicatePack = !isEmpty(
      await find(memoizedPacksInRow, (e) => e.packNo === pack.packetNo),
    )
      ? true
      : false;

    if (isDuplicatePack) {
      displayToast(`Duplicate barcode? ${pack.packetNo}`, 10000);
      // console.log(
      //   `Duplicate barcode? ${pack.packetNo} in saveFoundPackWithTallies`,
      // );
      playBadSound();
      return;
    }

    if (pack.packetNo.length !== 0) {
      const data = {
        uuid: uuid(),
        stocktakeId: props.route.params.stocktakeId,
        rowName: props.route.params.rowName,
        locationId: props.route.params.locationId,
        packNo: pack.packetNo,
        match: false,
        product: pack.productCode,
        known: true,
        type: 'pack',
        scannedOn: fecha.format(new Date(), 'YYYY-MM-DD hh:mm:ss'),
        scannedBy: currentUser,
        tallies: pack.tallies,
      };
      // const packFoundInAllPacks = memoizedPacksInRow.filter(
      //   (p) =>
      //     p.stocktakeId === stocktakeId &&
      //     p.packNo.toLowerCase() === pack.packetNo.toLowerCase(),
      // );
      /* eslint no-param-reassign: "error" */
      // data.known = packFoundInAllPacks.length > 0;
      // data.product =
      //   packFoundInAllPacks.length > 0 ? packFoundInAllPacks[0].product : 'n/a';
      // data.match = packFoundInAllPacks.length > 0;
      dispatch(addPackToRow(data));
      playGoodSound();
    } else {
      displayToast('Invalid pack entered');
      playBadSound();
    }
  };

  const ScannedPacks = () => {
    return memoizedPacksInRow.length > 0 ? (
      <FlatList
        ref={packListRef}
        data={memoizedPacksInRow}
        renderItem={PackItemRender}
        keyExtractor={(item) => item.uuid.toString()}
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
        <Text>Scan some Packs...</Text>
      </View>
    );
  };

  const hideOverlay = (name) => {
    if (name === 'add-found-pack') {
      setShowAddFoundPackOverlay(false);
    }
    if (name === 'confirm-bin') {
      setShowConfirmBinOverlay(false);
    }
  };

  const handleNewPackAddTally = () => {
    const {pieces, length} = newPackInput;
    const {tallies} = newPack;

    let newTallies = [];

    if (!parseFloat(length)) {
      displayToast('Invalid Length value');
      logger.error('Invalid Length value');
      return;
    }

    if (!parseInt(pieces)) {
      displayToast('Invalid Pieces value');
      logger.error('Invalid Pieces value');
      return;
    }

    if (!isNil(tallies)) {
      newTallies = tallies.filter(
        (e) => !(e.length === length && e.pieces === pieces),
      );
      newTallies = [...newTallies, {length, pieces}];
    } else {
      newTallies = [{length, pieces}];
    }

    setNewPack({...newPack, tallies: newTallies});
    setNewPackInput({});

    if (newPackLengthInputRef.current) newPackLengthInputRef.current.focus();
  };

  const handleNewPackSave = async () => {
    const {packetNo, tallies} = newPack;
    const {pieces, length} = newPackInput;
    setNewPackInput({});

    if (!isString(packetNo) || packetNo.length === 0) {
      playBadSound();
      logger.warn('Invalid PacketNo value');
      setShowAddFoundPackOverlay(false);
      return;
    }

    if (isString(productSelection) && productSelection.length > 0) {
      let foundProduct = await find(
        products,
        (e) => e.productCode === productSelection,
      );

      if (!foundProduct) {
        playBadSound();
        logger.warn('Unable to lookup product details...');
        setShowAddFoundPackOverlay(false);
        return;
      }

      if (memoizedShowTallyField) {
        if (isArray(tallies) && tallies.length > 0) {
          // Save RL pack with tallies
          // console.log('Save RL pack with tallies');
          playGoodSound();
          await saveFoundPackWithTallies({
            ...newPack,
            productCode: foundProduct.productCode,
          });
          setNewPack({});
          setShowAddFoundPackOverlay(false);
          setNewPackInput({});
          return;
        } else {
          displayToast('Saving RL pack without tally!');
          playBadSound();
          saveFoundPack(newPack.packetNo);
          setNewPack({});
          setShowAddFoundPackOverlay(false);
          // navigation.pop();
          return;
        }
      } else {
        // if (!parseFloat(length)) {
        //   displayToast('Invalid length value');
        //   logger.warn('Invalid length value');
        //   playBadSound();
        //   return;
        // }
        // console.log('Save fixed-length pack');

        if (!parseInt(pieces)) {
          displayToast('Saving fixed-length pack without tally!');
          // displayToast('Invalid pieces value');
          // logger.warn('Invalid pieces value');
          playBadSound();
          saveFoundPack(newPack.packetNo);
          return;
        }

        await saveFoundPackWithTallies({
          ...newPack,
          tallies: [{length: foundProduct.length, pieces}],
          productCode: foundProduct.productCode,
        });
        playGoodSound();
        setNewPack({});
        setShowAddFoundPackOverlay(false);
        // navigation.pop();
      }
    } else {
      displayToast('No Product selected');
      logger.warn('No Product selected');
      saveFoundPack(packetNo);
      setNewPack({});
      setShowAddFoundPackOverlay(false);
    }
  };

  const onChangeProductSelection = (value) => {
    setProductSelection(value);
    if (memoizedShowTallyField && newPackLengthInputRef.current)
      newPackLengthInputRef.current.focus();
    if (newPackPiecesInputRef.current) newPackPiecesInputRef.current.focus();
  };

  const overlayConfirmBinHeaders = [
    {accessor: 'packNo', label: 'Barcode'},
    {accessor: 'product', label: 'Product'},
    {accessor: 'gtin', label: 'GTIN'},
    {accessor: 'systemCount', label: 'Sys Pcs'},
    {accessor: 'actualCount', label: 'Act Pcs'},
  ];

  return (
    <View style={styles.container}>
      <Title
        text={`Row: ${rowName} ${type === 'bin' ? '(Bin)' : ''}`}
        description={`Scanned ${memoizedPacksInRow.length}${
          preCount > 0 ? `/${preCount}` : ''
        } pack${memoizedPacksInRow.length > 1 ? 's' : ''} (Unmatched: ${
          memoizedPacksInRow.filter((p) => !p.match).length
        })`}
      />
      {/* <View style={{flex: 1, flexDirection: 'column'}}> */}
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
          // Need the following to work correctly when scanning with external scanner
          setHiddenInput(hiddenInput + e.nativeEvent.text);
        }}
        onSubmitEditing={() => {
          logger.debug(`Scanned (hidden) barcode: ${hiddenInput}`);
          // console.log(`Scanned (hidden) barcode: ${hiddenInput}`);
          handleBarcodeReadSuccess(hiddenInput);
          setHiddenInput('');
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
          logger.debug(`Scanned barcode: ${userPackInput}`);
          handleBarcodeReadSuccess(userPackInput);
          // setHiddenInput('');
          setUserPackInput('');
        }}
      />
      {/* </View> */}
      {/* {false && (
        <Button
          buttonStyle={styles.shortButtonStyle}
          containerStyle={styles.buttonContainerStyle}
          title={
            showPacks ? 'Tap to Hide Barcodes' : 'Barcodes HIDDEN (Tap to Show)'
          }
          onPress={() => {
            setShowPacks(!showPacks);
          }}
        />
      )}
      {true && <ScannedPacks />} */}
      {!showPacks && (
        <Button
          buttonStyle={styles.shortButtonStyle}
          containerStyle={styles.buttonContainerStyle}
          title={
            showPacks ? 'Tap to Hide Barcodes' : 'Barcodes HIDDEN (Tap to Show)'
          }
          onPress={() => {
            setShowPacks(!showPacks);
          }}
        />
      )}
      {showPacks && <ScannedPacks />}
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
        isVisible={showConfirmBinOverlay}
        onBackdropPress={() => hideOverlay('confirm-bin')}
        overlayStyle={styles.overlayContainer}>
        <View>
          <TwoColumnsDataGrid
            title="Bin Snapshot"
            headers={overlayConfirmBinHeaders}
            hidden={[]}
            data={binPack}
          />
          <Input
            ref={confirmBinInputRef}
            blurOnSubmit={false}
            value={confirmBinPackActualCount}
            onChangeText={(text) => {
              setConfirmBinPackActualCount(parseInt(text));
            }}
            label={'Actual Count'}
            labelStyle={{marginTop: 10, color: 'black'}}
            keyboardType="number-pad"
            placeholder={
              isNumber(binPack.actualCount)
                ? binPack.actualCount.toString()
                : '0'
            }
            // labelStyle={styles.labelStyle}
            placeholderTextColor="gray"
            onSubmitEditing={() => {
              handleBarcodeReadSuccess();
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
                setShowConfirmBinOverlay(false);
                setConfirmBinPackActualCount(0);
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
                handleBarcodeReadSuccess();
              }}
            />
          </View>
        </View>
      </Overlay>
      <Overlay
        isVisible={showAddFoundPackOverlay}
        onBackdropPress={() => hideOverlay('add-found-pack')}
        overlayStyle={styles.overlayContainer}>
        <View>
          <Title text={'Found: ' + newPack.packetNo} />
          <AutoComplete
            data={memoizedProductLabels}
            // maxItems={2}
            maxHeight={200}
            label="Product"
            setValue={onChangeProductSelection}
          />
          {isString(productSelection) &&
            productSelection.length > 0 &&
            memoizedShowTallyField && (
              <>
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <Button
                    buttonStyle={{width: 100}}
                    containerStyle={styles.buttonContainerStyle}
                    title="Add Tally"
                    onPress={() => {
                      handleNewPackAddTally();
                    }}
                  />
                  <Button
                    buttonStyle={{width: 100}}
                    containerStyle={{
                      ...styles.buttonContainerStyle,
                      marginLeft: 30,
                    }}
                    title="Save"
                    onPress={async () => {
                      await handleNewPackSave();
                    }}
                  />
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <Input
                    ref={newPackLengthInputRef}
                    blurOnSubmit={false}
                    value={newPackInput['length'] || ''}
                    onSubmitEditing={() => {
                      if (newPackPiecesInputRef.current)
                        newPackPiecesInputRef.current.focus();
                    }}
                    onChangeText={(text) => {
                      if (parseFloat(text)) {
                        setNewPackInput({
                          ...newPackInput,
                          length: parseFloat(text),
                        });
                      } else {
                        displayToast('Invalid Length value');
                      }
                    }}
                    label={'Length'}
                    labelStyle={{marginTop: 10, color: 'black'}}
                    keyboardType="decimal-pad"
                    onFocus={() => {
                      setNewPack({...newPack, length: ''});
                      setNewPackInput({...newPackInput, length: ''});
                    }}
                    containerStyle={{width: 100}}
                    // labelStyle={styles.labelStyle}
                    placeholderTextColor="gray"
                    errorMessage={newPackInputErrors.length}
                  />
                  <Input
                    ref={newPackPiecesInputRef}
                    blurOnSubmit={false}
                    value={newPackInput.pieces || ''}
                    onChangeText={(text) => {
                      if (parseInt(text)) {
                        setNewPackInput({
                          ...newPackInput,
                          pieces: parseInt(text),
                        });
                      } else {
                        displayToast('Invalid Pieces value');
                      }
                    }}
                    onFocus={() => {
                      // setNewPack({...newPack, pieces: ''});
                      setNewPackInput({...newPackInput, pieces: ''});
                    }}
                    keyboardType="numeric"
                    label={'Pieces'}
                    labelStyle={{marginTop: 10, color: 'black'}}
                    containerStyle={{width: 100, marginLeft: 30}}
                    onSubmitEditing={() => {
                      handleNewPackAddTally();
                    }}
                    // labelStyle={styles.labelStyle}
                    placeholderTextColor="gray"
                    errorMessage={newPackInputErrors.pieces}
                  />
                </View>
              </>
            )}
          {isString(productSelection) &&
            productSelection.length > 0 &&
            !memoizedShowTallyField && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Input
                  ref={newPackPiecesInputRef}
                  blurOnSubmit={false}
                  value={newPackInput.pieces?.toString() || ''}
                  onChangeText={(text) => {
                    if (parseInt(text)) {
                      setNewPackInput({
                        ...newPackInput,
                        pieces: parseInt(text),
                      });
                    } else {
                      displayToast('Invalid Pieces value');
                    }
                  }}
                  label={'Pieces'}
                  labelStyle={{marginTop: 10, color: 'black'}}
                  containerStyle={{width: 100, marginLeft: 30}}
                  // labelStyle={styles.labelStyle}
                  placeholderTextColor="gray"
                  keyboardType="numeric"
                  errorMessage={newPackInputErrors.pieces}
                />
                <Button
                  buttonStyle={{width: 100}}
                  containerStyle={{
                    ...styles.buttonContainerStyle,
                    marginLeft: 30,
                  }}
                  title="Save"
                  onPress={async () => {
                    await handleNewPackSave();
                  }}
                />
              </View>
            )}
          {memoizedShowTallyField &&
            isArray(newPack.tallies) &&
            newPack?.tallies.length > 0 && (
              <View style={{flexDirection: 'row', flex: 0, flexWrap: 'wrap'}}>
                {newPack.tallies
                  .map((e) => ({...e, display: `${e.length}/${e.pieces}`}))
                  .map((e) => (
                    <BarcodeBubbleAction
                      item={e}
                      id={'display'}
                      key={e.length}
                      action={() => {
                        displayDialogWithOptions(`Confirm?`, `Remove ${e}`, {
                          buttons: {
                            positiveText: 'OK',
                            negativeText: 'Cancel',
                          },
                          success: () => {
                            const {tallies} = newPack;

                            let newTallies = tallies;

                            if (!isNil(tallies)) {
                              newTallies = tallies.filter(
                                (t) =>
                                  t.length !== e.length &&
                                  t.pieces !== e.pieces,
                              );
                            }
                            setNewPack({...newPack, tallies: newTallies});
                          },
                        });
                      }}
                    />
                  ))}
              </View>
            )}
        </View>
      </Overlay>
    </View>
  );
};

export default StocktakePackScreen;
