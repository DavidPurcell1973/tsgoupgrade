import React, {useEffect, useRef} from 'react';
import fetch from 'node-fetch';
import {v4 as uuid} from 'uuid';
import fecha from 'fecha';
import {View, Text, TouchableHighlight} from 'react-native';
import {ListItem, Icon} from 'react-native-elements';
import Swipeable from 'react-native-swipeable';
import {useNavigation} from '@react-navigation/native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import fs from 'react-native-fs';
import moment from 'moment';
import logger from '../../helpers/logger';
import styles from '../../styles/styles';
import {chunk} from 'lodash';
import {
  apiCreateRows,
  apiUpdatePacks,
  initiateStocktakePacksExport,
  initiateStocktakeRowExport,
  markStocktakeExportClear,
  addRowToStocktake,
  markStocktakeExportDone,
  addPacksToRow,
  deleteRowFromStocktake,
  clearRowByStocktakeId,
  clearPacksByStocktakeId,
} from '../../reducers/stocktake/stocktakeReducer';
import {
  apiTokenSelector,
  apiUrlSelector,
} from '../../selectors/common/commonSelector';
import {
  rowPacksByStocktakeIdSelector,
  rowsSelector,
} from '../../selectors/stocktake/stocktakeSelector';
import {displayToast} from '../../helpers/utils';
import {ensureDirectoryExists, writeFile} from '../../helpers/file';

const StocktakeItem = (props) => {
  const navigation = useNavigation();
  const swipeableRef = useRef();
  const dispatch = useDispatch();
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const apiToken = useSelector(apiTokenSelector, shallowEqual);
  const deviceName = useSelector((state) => state.appStore.username);
  const exporting = useSelector((state) => state.stocktakeStore.exporting);
  const exportStocktakeId = useSelector(
    (state) => state.stocktakeStore.exportStocktakeId,
  );
  const exportingRows = useSelector(
    (state) => state.stocktakeStore.exportingRows,
  );
  const locations = useSelector((state) => state.stocktakeStore.locations);
  const products = useSelector((state) => state.stocktakeStore.products);
  const options = useSelector((state) => state.stocktakeStore.options);
  const {item, ref} = props;
  const {hasPendingChanges, activeStocktakeId} = item;
  const isTestStocktake = item.description.toLowerCase() === 'test export';
  const rows = useSelector((state) =>
    rowsSelector(state, {route: {params: {stocktakeId: item.stocktakeId}}}),
  );
  const rowPacks = useSelector((state) =>
    rowPacksByStocktakeIdSelector(state, {
      route: {params: {stocktakeId: item.stocktakeId}},
    }),
  );
  const pendingChanges = rows.filter((row) => row.new).length + rowPacks.length;

  const isActiveStocktake =
    item.stocktakeId === activeStocktakeId || activeStocktakeId === 0;

  const genRanHex = (size) =>
    [...Array(size)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');

  const stocktakeRightSwipableGenerateDummyDataItem = [
    <TouchableHighlight
      style={[styles.rightSwipeItem, {backgroundColor: 'yellow'}]}
      onPress={() => {
        const totalPacks = options.generateDummyPacksCount || 5000;
        const packsEachCat = totalPacks / 4;

        displayToast(`Generating ${totalPacks} dummy packs`);

        console.log('Clear existing packs and rows...');
        dispatch(clearRowByStocktakeId(item.stocktakeId));
        dispatch(clearPacksByStocktakeId(item.stocktakeId));

        dispatch(
          deleteRowFromStocktake({
            stocktakeId: item.stocktakeId,
            locationId: locations[0].locationId,
            rowName: 'TestBins',
          }),
        );
        dispatch(
          deleteRowFromStocktake({
            stocktakeId: item.stocktakeId,
            locationId: locations[0].locationId,
            rowName: 'TestRLPacks',
          }),
        );
        dispatch(
          deleteRowFromStocktake({
            stocktakeId: item.stocktakeId,
            locationId: locations[0].locationId,
            rowName: 'TestFLPacks',
          }),
        );
        dispatch(
          deleteRowFromStocktake({
            stocktakeId: item.stocktakeId,
            locationId: locations[0].locationId,
            rowName: 'TestUnknownPacks',
          }),
        );

        console.log('Generating Rows...');
        // Add Bin Row
        dispatch(
          addRowToStocktake({
            stocktakeId: item.stocktakeId,
            locationId: locations[0].locationId,
            rowInput: 'TestBins',
            preCount: packsEachCat,
            type: 'bin',
          }),
        );

        // Add RL Row
        dispatch(
          addRowToStocktake({
            stocktakeId: item.stocktakeId,
            locationId: locations[0].locationId,
            rowInput: 'TestRLPacks',
            preCount: packsEachCat,
            type: 'pack',
          }),
        );

        // Add FL Row
        dispatch(
          addRowToStocktake({
            stocktakeId: item.stocktakeId,
            locationId: locations[0].locationId,
            rowInput: 'TestFLPacks',
            preCount: packsEachCat,
            type: 'pack',
          }),
        );

        // Add Unknown Row
        dispatch(
          addRowToStocktake({
            stocktakeId: item.stocktakeId,
            locationId: locations[0].locationId,
            rowInput: 'TestUnknownPacks',
            preCount: packsEachCat,
            type: 'pack',
          }),
        );

        let packs = [];

        console.log('Processing unknown packs...');
        // Save unknown packProcessings
        for (let i in Array.from(Array(packsEachCat).keys())) {
          const data = {
            uuid: uuid(),
            stocktakeId: item.stocktakeId,
            rowName: 'TestUnknownPacks',
            locationId: locations[0].locationId,
            packNo: i + '_' + genRanHex(12),
            match: false,
            product: genRanHex(8),
            known: false,
            type: 'pack',
            systemCount: parseInt(Math.random() * 100, 10),
            actualCount: parseInt(Math.random() * 100, 10),
            scannedOn: fecha.format(new Date(), 'YYYY-MM-DD hh:mm:ss'),
            scannedBy: 'testuser',
          };
          packs.push(data);
        }

        console.log('Processing Bin packs...');
        // Save bin packs
        for (let i in Array.from(Array(packsEachCat).keys())) {
          const data = {
            uuid: uuid(),
            stocktakeId: item.stocktakeId,
            rowName: 'TestBins',
            locationId: locations[0].locationId,
            packNo: i + '_' + genRanHex(12),
            match: true,
            product: genRanHex(8),
            gtin: genRanHex(8),
            known: true,
            type: 'bin',
            systemCount: parseInt(Math.random() * 100, 10),
            actualCount: parseInt(Math.random() * 100, 10),
            scannedOn: fecha.format(new Date(), 'YYYY-MM-DD hh:mm:ss'),
            scannedBy: 'testuser',
          };
          packs.push(data);
        }

        console.log('Processing FL packs...');
        // Save fixed length packs
        const flProducts = products.filter((e) => e.isFixedLength);
        for (let i in Array.from(Array(packsEachCat).keys())) {
          const randomProduct =
            flProducts[Math.floor(Math.random() * flProducts.length)];
          const data = {
            uuid: uuid(),
            stocktakeId: item.stocktakeId,
            rowName: 'TestFLPacks',
            locationId: locations[0].locationId,
            packNo: i + '_' + genRanHex(12),
            product: randomProduct.productCode,
            known: true,
            scannedOn: fecha.format(new Date(), 'YYYY-MM-DD hh:mm:ss'),
            scannedBy: 'testuser',
            match: false,
            type: 'pack',
            tallies: [
              {
                length: randomProduct.length,
                pieces: parseInt(Math.random() * 100, 10),
              },
            ],
          };
          packs.push(data);
        }

        console.log('Processing RL packs...');
        // Save RL packs
        const rlProducts = products.filter((e) => !e.isFixedLength);
        for (let i in Array.from(Array(packsEachCat).keys())) {
          const randomProduct =
            rlProducts[Math.floor(Math.random() * rlProducts.length)];
          const data = {
            uuid: uuid(),
            stocktakeId: item.stocktakeId,
            rowName: 'TestRLPacks',
            locationId: locations[0].locationId,
            packNo: i + '_' + genRanHex(12),
            product: randomProduct.productCode,
            known: true,
            scannedOn: fecha.format(new Date(), 'YYYY-MM-DD hh:mm:ss'),
            scannedBy: 'testuser',
            match: false,
            type: 'pack',
            tallies: [
              {
                length: 1.2,
                pieces: parseInt(Math.random() * 100, 10),
              },
              {
                length: 1.4,
                pieces: parseInt(Math.random() * 100, 10),
              },
              {
                length: 1.6,
                pieces: parseInt(Math.random() * 100, 10),
              },
              {
                length: 1.8,
                pieces: parseInt(Math.random() * 100, 10),
              },
            ],
          };
          packs.push(data);
        }

        const packChunks = chunk(packs, 1000);
        packChunks.map((e, i) => {
          setTimeout(() => {
            console.log('Updating internal state ' + (i + 1));
            dispatch(addPacksToRow(packChunks[i]));
          }, (i + 1) * 1000);
        });

        displayToast(`Successfully generated dummy packs`);
      }}>
      <Text>Dummy</Text>
    </TouchableHighlight>,
  ];

  const stocktakeRightSwipableItems = [
    <TouchableHighlight
      style={[styles.rightSwipeItem, {backgroundColor: 'gray'}]}
      onPress={() => {
        dispatch(clearRowByStocktakeId(item.stocktakeId));
        dispatch(clearPacksByStocktakeId(item.stocktakeId));
        setTimeout(() => {
          if (swipeableRef.current) swipeableRef.current?.recenter();
        }, 100);
      }}>
      <Text>Clear</Text>
    </TouchableHighlight>,
    <TouchableHighlight
      style={[styles.rightSwipeItem, {backgroundColor: '#00BFFF'}]}
      onPress={() => {
        if (!exporting) {
          (async () => {
            // Save snapshot of the rows and packs before exporting
            try {
              const externalDirectoryPath = `${fs.ExternalDirectoryPath}/stocktakeSnapshots`;
              const snapshot1FullPath = `${externalDirectoryPath}/snapshot-${moment().format(
                'YYYYMMDDHHmm',
              )}.json`;
              await ensureDirectoryExists(externalDirectoryPath);
              await writeFile(snapshot1FullPath, JSON.stringify(rowPacks));
              await logger.info(`Saved ${snapshot1FullPath}`);
            } catch (err) {
              await logger.error(err);
            }

            try {
              const downloadDirectoryPath = `${fs.DownloadDirectoryPath}/com.timbersmart.tsgo/stocktake`;
              const snapshot2FullPath = `${downloadDirectoryPath}/snapshot-${moment().format(
                'YYYYMMDDHHmm',
              )}.json`;
              await ensureDirectoryExists(downloadDirectoryPath);
              await writeFile(snapshot2FullPath, JSON.stringify(rowPacks));
              await logger.info(`Saved ${snapshot2FullPath}`);
            } catch (err) {
              await logger.error(err);
            }

            dispatch(markStocktakeExportClear());
            dispatch(initiateStocktakeRowExport(item.stocktakeId));
          })();
        } else {
          displayToast('Exporting already in progress');
        }
        setTimeout(() => {
          if (swipeableRef.current) swipeableRef.current?.recenter();
        }, 100);
        // setTimeout(() => {
        //   dispatch(markStocktakeExportClear());
        // }, 10000);
      }}>
      <Text>Export</Text>
    </TouchableHighlight>,
  ];

  useEffect(() => {
    if (exporting && exportStocktakeId === item.stocktakeId) {
      const newRows = rows.filter((row) => row.new);

      // dispatch(markStocktakeExportDone(item.stocktakeId));
      if (exportingRows) {
        // Exporting is true and Exporting Rows is also true
        const rowData = newRows.map((e) => ({...e, deviceName}));
        logger.debug(JSON.stringify(rowData));
        if (rowData.length > 0)
          dispatch(apiCreateRows(apiUrl, apiToken, rowData));
        dispatch(initiateStocktakePacksExport(item.stocktakeId));
        displayToast('Successfully sent new rows to the server');
      } else if (!exportingRows && newRows.length === 0) {
        // Exporting row is done and no more new rows to sync
        const packData = rowPacks.map((e) => ({...e, deviceName}));
        // logger.debug(JSON.stringify(packData));
        logger.info('Exporting pack data now...');
        if (packData.length > 0) {
          const packChunks = chunk(
            packData,
            options.uploadBatchCountMax || 100,
          );
          displayToast(`Queueing ${packChunks.length} batches...`);
          packChunks.map((e, i) => {
            setTimeout(() => {
              const message =
                'Queueing batch ' +
                (i + 1) +
                '/' +
                packChunks.length +
                ' with ' +
                packChunks[i].length +
                ' items...';
              logger.info(message);
              dispatch(apiUpdatePacks(apiUrl, apiToken, packChunks[i]));
            }, 1 * 1000);
            displayToast(`Queued ${packChunks.length} batches...`);
          });
        }

        dispatch(markStocktakeExportDone(item.stocktakeId));
        displayToast('Successfully sent all barcodes to the server');
        logger.info('Successfully sent all barcodes to the server');
        setTimeout(() => {
          dispatch(markStocktakeExportDone(item.stocktakeId));
          dispatch(clearRowByStocktakeId(item.stocktakeId));
          dispatch(clearPacksByStocktakeId(item.stocktakeId));
          logger.info(`Clearing current Stocktake ${item.stocktakeId}`);
        }, 5000);
      }
    }
  }, [exporting, exportingRows, rows]);

  return (
    <Swipeable
      ref={swipeableRef}
      rightButtons={
        isTestStocktake
          ? [
              ...stocktakeRightSwipableGenerateDummyDataItem,
              ...stocktakeRightSwipableItems,
            ]
          : stocktakeRightSwipableItems
      }>
      <ListItem
        key={item.stocktakeId}
        onPress={() => {
          navigation.navigate('StocktakeRow', {...item, isTestStocktake});
        }}
        disabled={!isActiveStocktake}>
        <Icon
          name={pendingChanges > 0 ? 'exclamation' : 'check-circle'}
          type="font-awesome"
          style={{width: 25}}
        />
        <ListItem.Content>
          <ListItem.Title style={isActiveStocktake ? {} : {color: 'lightgray'}}>
            {item.description || 'Unnamed Stocktake'}
          </ListItem.Title>
          <ListItem.Subtitle
            style={isActiveStocktake ? {} : {color: 'lightgray'}}>
            {/* <View style={styles.subtitleView}> */}
            {/* <Text style={styles.subtitleText}> */}
            {`${item.description ? item.description : 'No description'} ${
              pendingChanges > 0
                ? `(${pendingChanges} changes pending)`
                : '(No changes)'
            }`}
            {/* </Text>
            </View> */}
          </ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
    </Swipeable>
  );
};

export default StocktakeItem;
